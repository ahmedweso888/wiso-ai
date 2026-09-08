/**
 * Provider-independent Study Agent tasks. Prompts + normalized JSON schemas live
 * here; the provider is an implementation detail resolved by the runtime.
 *
 * WISO Engine integration: question generation now flows through the batch
 * orchestrator which handles routing (Luna/Terra/Sol), validation gate,
 * dedup, retry, and escalation automatically.
 */
import { runStructuredTask } from "./runtime.server";
import { generateBatch } from "../engine/batch.server";
import { withCredits } from "../engine/credits.server";
import { getActiveConfig } from "./runtime.server";
import type {
  ExtractedSyllabus,
  GeneratedPlan,
  GeneratedQuestion,
  MistakeAnalysis,
  MistakeAnalysisRequest,
  PerformanceSnapshot,
  PlannerRequest,
  QuestionGenerationRequest,
  ValidationReport,
} from "../types";
import type { TierId } from "../engine/config";

const OBJ = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const QUESTION_SCHEMA = OBJ({
  questions: {
    type: "array",
    items: OBJ({
      prompt: { type: "string" },
      questionType: { type: "string" },
      difficulty: { type: "string" },
      difficultyScore: { type: "number" },
      options: {
        type: "array",
        items: OBJ({ key: { type: "string" }, text: { type: "string" } }),
      },
      correctAnswer: { type: "string" },
      explanation: { type: "string" },
      conceptsTested: { type: "array", items: { type: "string" } },
      commonTrap: { type: "string" },
      estimatedTimeSeconds: { type: "number" },
      sourceReferences: {
        type: "array",
        items: OBJ({
          documentId: { type: ["string", "null"] },
          pageNumber: { type: ["number", "null"] },
          quote: { type: "string" },
        }),
      },
    }),
  },
});

const NIGHTMARE_RULES = `You are the Question Generator of an Arabic study platform.
Hard means: deep understanding, multi-concept transfer, hidden assumptions, common misconceptions, edge cases and reasoning.
NEVER make a question hard by adding pointless numbers or length. NEVER go outside the student's syllabus. NEVER produce ambiguous or impossible questions.
Every question needs difficultyScore, conceptsTested, correctAnswer, explanation, sourceReferences, commonTrap and estimatedTimeSeconds.`;

/**
 * Generate questions through the WISO batch orchestrator.
 * Handles: routing (Luna/Terra/Sol), validation gate, dedup, retry, escalation.
 * Credit reservation is handled atomically via the credits module.
 */
export async function generateQuestionsTask(
  userId: string,
  request: QuestionGenerationRequest,
): Promise<GeneratedQuestion[]> {
  const { autoRoutingEnabled, config } = await getActiveConfig();

  // Inject the provider-level generation function
  const generateFn = async (
    _tier: TierId,
    model: string,
    req: QuestionGenerationRequest,
    count: number,
  ): Promise<GeneratedQuestion[]> => {
    const result = await runStructuredTask<{ questions: GeneratedQuestion[] }>({
      userId,
      agent: "questions",
      call: {
        system: NIGHTMARE_RULES,
        user: `Generate ${count} questions.\nRequest: ${JSON.stringify(req)}\nLanguage: ${req.language}. Nightmare mode: ${req.nightmareMode}.`,
        schemaName: "generated_questions",
        jsonSchema: QUESTION_SCHEMA,
      },
      counts: { questionsGenerated: count },
      difficulty: req.difficulties[0],
      overrideModel: model,
      overrideTier: _tier,
    });
    return result.questions ?? [];
  };

  // LLM validation function (optional, injected into batch)
  const validateFn = async (
    question: GeneratedQuestion,
  ): Promise<{ passed: boolean } | null> => {
    try {
      const report = await validateQuestionTask(userId, question);
      return { passed: report.passed };
    } catch {
      return null;
    }
  };

  // Run with credit reservation
  return withCredits(
    userId,
    `qgen_${request.subjectSlug}_${Date.now()}`,
    "questions",
    request.count,
    async () => {
      const batchResult = await generateBatch(
        request,
        [], // existingQuestions — would be loaded from DB in a full implementation
        generateFn,
        validateFn,
        autoRoutingEnabled,
        config.model,
      );
      return batchResult.approved;
    },
  );
}

export async function validateQuestionTask(
  userId: string,
  question: GeneratedQuestion,
): Promise<ValidationReport> {
  return runStructuredTask<ValidationReport>({
    userId,
    agent: "validation",
    call: {
      system:
        "You are the Question Validator. Reject questions that are out of syllabus, unanswerable, have multiple correct answers, contradict their explanation, are duplicates, or whose difficulty is meaningless.",
      user: `Validate this question:\n${JSON.stringify(question)}`,
      schemaName: "validation_report",
      jsonSchema: OBJ({
        passed: { type: "boolean" },
        checks: {
          type: "array",
          items: OBJ({
            check: { type: "string" },
            passed: { type: "boolean" },
            note: { type: "string" },
          }),
        },
      }),
    },
  });
}

export async function generatePlanTask(
  userId: string,
  request: PlannerRequest,
): Promise<GeneratedPlan> {
  return runStructuredTask<GeneratedPlan>({
    userId,
    agent: "planner",
    call: {
      system:
        "You are the Study Planner. Plan backwards from the deadline: finish the syllabus first, then revision and high-difficulty practice.",
      user: `Build the plan for: ${JSON.stringify(request)}`,
      schemaName: "generated_plan",
      jsonSchema: OBJ({
        deadline: { type: "string" },
        dailyHoursTarget: { type: "number" },
        items: {
          type: "array",
          items: OBJ({
            level: { type: "string" },
            phase: { type: "string" },
            title: { type: "string" },
            notes: { type: "string" },
            subjectSlug: { type: "string" },
            startsOn: { type: "string" },
            endsOn: { type: "string" },
            estimatedMinutes: { type: "number" },
            questionTarget: { type: "number" },
            targetDifficulty: { type: "string" },
          }),
        },
      }),
    },
  });
}

const SYLLABUS_SCHEMA = OBJ({
  subjectSlug: { type: "string" },
  documentId: { type: "string" },
  units: {
    type: "array",
    items: OBJ({
      title: { type: "string" },
      chapters: {
        type: "array",
        items: OBJ({
          title: { type: "string" },
          pageFrom: { type: ["number", "null"] },
          pageTo: { type: ["number", "null"] },
          topics: {
            type: "array",
            items: OBJ({
              title: { type: "string" },
              estimatedMinutes: { type: "number" },
              concepts: {
                type: "array",
                items: OBJ({
                  title: { type: "string" },
                  description: { type: "string" },
                  difficulty: { type: "string" },
                  learningObjectives: {
                    type: "array",
                    items: OBJ({ statement: { type: "string" } }),
                  },
                  sourceReferences: {
                    type: "array",
                    items: OBJ({
                      documentId: { type: ["string", "null"] },
                      pageNumber: { type: ["number", "null"] },
                      quote: { type: "string" },
                    }),
                  },
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});

export async function analyzeDocumentTask(
  userId: string,
  input: { documentId: string; text?: string; kind: "document" | "image" },
): Promise<ExtractedSyllabus> {
  return runStructuredTask<ExtractedSyllabus>({
    userId,
    agent: "syllabus",
    bulk: true,
    call: {
      system:
        "You are the Syllabus Agent. Map the material into units/chapters/topics/concepts. Every concept MUST carry a source reference; drop anything you cannot source.",
      user: `Document id: ${input.documentId}\nKind: ${input.kind}\n${input.text ?? ""}`,
      schemaName: "extracted_syllabus",
      jsonSchema: SYLLABUS_SCHEMA,
    },
    counts:
      input.kind === "image" ? { imagesAnalyzed: 1 } : { documentsAnalyzed: 1 },
  });
}

export async function analyzeMistakesTask(
  userId: string,
  request: MistakeAnalysisRequest,
): Promise<MistakeAnalysis[]> {
  const result = await runStructuredTask<{ analyses: MistakeAnalysis[] }>({
    userId,
    agent: "mistakes",
    call: {
      system:
        "You are the Mistake Analyzer. Classify each mistake, detect repeated patterns and point at the weak concepts to re-test.",
      user: JSON.stringify(request),
      schemaName: "mistake_analyses",
      jsonSchema: OBJ({
        analyses: {
          type: "array",
          items: OBJ({
            questionId: { type: "string" },
            mistakeType: { type: "string" },
            analysis: { type: "string" },
            weakConceptIds: { type: "array", items: { type: "string" } },
          }),
        },
      }),
    },
  });
  return result.analyses ?? [];
}

export async function performanceTask(
  userId: string,
  payload: unknown,
): Promise<PerformanceSnapshot> {
  return runStructuredTask<PerformanceSnapshot>({
    userId,
    agent: "performance",
    call: {
      system:
        "You are the Performance Analyzer. Compute mastery, accuracy and the weakest concepts from the attempt data.",
      user: JSON.stringify(payload ?? {}),
      schemaName: "performance_snapshot",
      jsonSchema: OBJ({
        overallMastery: { type: "number" },
        accuracy: { type: "number" },
        questionsSolved: { type: "number" },
        hardSolved: { type: "number" },
        nightmareSolved: { type: "number" },
        averageTimeSeconds: { type: "number" },
        weakConcepts: {
          type: "array",
          items: OBJ({
            conceptId: { type: "string" },
            title: { type: "string" },
            masteryScore: { type: "number" },
          }),
        },
      }),
    },
  });
}
