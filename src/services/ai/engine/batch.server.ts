/**
 * WISO Batch Generation Orchestrator.
 *
 * Splits large requests into sub-batches, routes each sub-batch through the
 * intelligent router, generates via the provider, validates through the
 * validation gate, deduplicates, and performs replacement rounds until the
 * requested count is reached or retry limits are exhausted.
 *
 * Pipeline per sub-batch:
 *   route → generate → validate → dedup → approve/reject
 *
 * Escalation for hard questions:
 *   Terra generate → validate → if invalid → Terra retry → validate
 *   → if still invalid → Sol generate replacement → validate → accept/discard
 *
 * تعجيزi/nightmare → Sol directly, no Terra detour.
 */
import { routeTask } from "./router.server";
import { validationGate } from "./validation-gate.server";
import { deduplicateBatch } from "./dedup.server";
import { generateRequestId, logAiEvent } from "./logging.server";
import {
  ENGINE_CONFIG,
  type DifficultyLevel,
  type TaskType,
  type TierId,
} from "./config";
import type { GeneratedQuestion, QuestionGenerationRequest } from "../types";

export type BatchResult = {
  requestId: string;
  approved: GeneratedQuestion[];
  rejected: GeneratedQuestion[];
  stats: BatchStats;
};

export type BatchStats = {
  requested: number;
  generated: number;
  validated: number;
  approved: number;
  rejected: number;
  duplicates: number;
  retries: number;
  escalations: number;
  rounds: number;
};

type GenerateFn = (
  tier: TierId,
  model: string,
  request: QuestionGenerationRequest,
  count: number,
) => Promise<GeneratedQuestion[]>;

type ValidateFn = (
  question: GeneratedQuestion,
) => Promise<{ passed: boolean } | null>;

/**
 * Orchestrates batch question generation with routing, validation, dedup,
 * and replacement rounds.
 *
 * @param request  - The original generation request
 * @param existingQuestions - Already-approved questions for dedup comparison
 * @param generateFn - Provider-level generation function (injected for testability)
 * @param validateFn - Optional LLM validation function (injected for testability)
 * @param autoRoutingEnabled - Whether the router should tier-route
 * @param fallbackModel - Model when auto-routing is off
 */
export async function generateBatch(
  request: QuestionGenerationRequest,
  existingQuestions: GeneratedQuestion[],
  generateFn: GenerateFn,
  validateFn: ValidateFn | null,
  autoRoutingEnabled: boolean,
  fallbackModel: string,
): Promise<BatchResult> {
  const requestId = generateRequestId();
  const batchSize = ENGINE_CONFIG.batchSize;
  const maxRounds = ENGINE_CONFIG.maxReplacementRounds;

  const stats: BatchStats = {
    requested: request.count,
    generated: 0,
    validated: 0,
    approved: 0,
    rejected: 0,
    duplicates: 0,
    retries: 0,
    escalations: 0,
    rounds: 0,
  };

  let approved: GeneratedQuestion[] = [];
  let rejected: GeneratedQuestion[] = [];
  let toGenerate = request.count;

  for (let round = 0; round < maxRounds && toGenerate > 0; round++) {
    stats.rounds = round + 1;

    // Split into sub-batches
    const subBatchCount = Math.min(batchSize, toGenerate);
    const subBatches = Math.ceil(toGenerate / batchSize);

    const roundQuestions: GeneratedQuestion[] = [];

    for (let b = 0; b < subBatches; b++) {
      const currentBatchSize = Math.min(batchSize, toGenerate - b * batchSize);
      if (currentBatchSize <= 0) break;

      const subRequest: QuestionGenerationRequest = {
        ...request,
        count: currentBatchSize,
        excludeQuestionIds: [
          ...(request.excludeQuestionIds ?? []),
          ...approved.map((_, i) => `gen_${i}`),
        ],
      };

      // Determine difficulty for this sub-batch (use first difficulty from request)
      const difficulty = request.difficulties[0] as DifficultyLevel | undefined;

      const routing = routeTask({
        taskType: "questions" as TaskType,
        difficulty,
        autoRoutingEnabled,
        fallbackModel,
      });

      logAiEvent({
        requestId,
        taskType: "questions",
        tier: routing.tier,
        model: routing.model,
        status: "generating",
        questionsGenerated: currentBatchSize,
      });

      // Generate
      let generated: GeneratedQuestion[] = [];
      try {
        generated = await generateFn(routing.tier, routing.model, subRequest, currentBatchSize);
        stats.generated += generated.length;
      } catch (error) {
        logAiEvent({
          requestId,
          taskType: "questions",
          tier: routing.tier,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }

      // Validate each question
      for (const question of generated) {
        stats.validated++;

        const llmResult = validateFn ? await validateFn(question) : null;
        const gateResult = await validationGate(
          question,
          difficulty ?? "medium",
          existingQuestions,
          roundQuestions,
          llmResult && "passed" in llmResult ? llmResult : null,
        );

        if (gateResult.valid) {
          roundQuestions.push(question);
        } else {
          stats.rejected++;
          rejected.push(question);

          // Retry logic for Terra-routed difficulties
          if (
            gateResult.retryRecommended &&
            difficulty &&
            (difficulty === "basic" || difficulty === "medium" || difficulty === "hard")
          ) {
            stats.retries++;
            // Terra retry
            try {
              const retryRequest: QuestionGenerationRequest = {
                ...subRequest,
                count: 1,
              };
              const retryQ = await generateFn("terra", fallbackModel, retryRequest, 1);
              if (retryQ.length > 0) {
                const retryGate = await validationGate(
                  retryQ[0],
                  difficulty,
                  existingQuestions,
                  roundQuestions,
                  null,
                );
                if (retryGate.valid) {
                  roundQuestions.push(retryQ[0]);
                  stats.generated++;
                } else {
                  // Escalate to Sol
                  if (gateResult.escalationRecommended || retryGate.escalationRecommended) {
                    stats.escalations++;
                    try {
                      const solRequest: QuestionGenerationRequest = {
                        ...subRequest,
                        count: 1,
                      };
                      const solQ = await generateFn("sol", "openai/gpt-5.6-sol", solRequest, 1);
                      if (solQ.length > 0) {
                        const solGate = await validationGate(
                          solQ[0],
                          difficulty,
                          existingQuestions,
                          roundQuestions,
                          null,
                        );
                        if (solGate.valid) {
                          roundQuestions.push(solQ[0]);
                          stats.generated++;
                        } else {
                          // Discard
                          rejected.push(solQ[0]);
                        }
                      }
                    } catch {
                      // Sol generation failed — discard
                    }
                  }
                }
              }
            } catch {
              // Retry failed — continue
            }
          }
        }
      }
    }

    // Deduplicate within this round and against existing
    const { unique, duplicates: dups } = deduplicateBatch(roundQuestions);
    stats.duplicates += dups.length;
    approved.push(...unique);
    toGenerate = request.count - approved.length;

    logAiEvent({
      requestId,
      taskType: "questions",
      status: "round_complete",
      questionsApproved: approved.length,
      questionsRejected: stats.rejected,
      retries: stats.retries,
      escalations: stats.escalations,
      rounds: stats.rounds,
    });

    if (toGenerate <= 0) break;
  }

  stats.approved = approved.length;

  logAiEvent({
    requestId,
    taskType: "questions",
    status: "batch_complete",
    questionsGenerated: stats.generated,
    questionsApproved: stats.approved,
    questionsRejected: stats.rejected,
    retries: stats.retries,
    escalations: stats.escalations,
    rounds: stats.rounds,
  });

  return { requestId, approved, rejected, stats };
}
