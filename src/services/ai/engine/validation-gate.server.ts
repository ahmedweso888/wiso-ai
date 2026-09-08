/**
 * WISO Validation Gate — mandatory server-side validation stage.
 *
 * Validates generated questions for:
 * - JSON/schema correctness
 * - Required fields present and non-empty
 * - Question clarity and educational quality
 * - Answer correctness (correctAnswer exists and matches an option for MCQ)
 * - Explanation quality (non-trivial length)
 * - Difficulty correctness (score matches declared difficulty)
 * - Source/context consistency
 * - Duplicate/near-duplicate status (via dedup module)
 *
 * Returns structured results. Never lets invalid content pass as approved.
 */
import type { GeneratedQuestion, ValidationReport } from "../types";
import type { DifficultyLevel } from "./config";
import { isDuplicate } from "./dedup.server";

export type ValidationCheckResult = {
  check: string;
  passed: boolean;
  note?: string;
};

export type ValidationGateResult = {
  valid: boolean;
  score: number;
  reasons: string[];
  checks: Record<string, boolean>;
  retryRecommended: boolean;
  escalationRecommended: boolean;
};

/** Expected difficulty-score ranges for each difficulty level. */
const DIFFICULTY_SCORE_RANGES: Record<DifficultyLevel, [number, number]> = {
  basic: [1, 30],
  medium: [31, 55],
  hard: [56, 75],
  very_hard: [76, 90],
  nightmare: [91, 100],
};

/** Minimum acceptable explanation length (characters). */
const MIN_EXPLANATION_LENGTH = 20;

/** Minimum acceptable prompt length (characters). */
const MIN_PROMPT_LENGTH = 10;

/**
 * Validates a single generated question structurally and semantically.
 * Does NOT call an LLM — this is deterministic, fast validation.
 * LLM-based validation is done separately via `validateQuestionTask`.
 */
export function validateQuestionStructure(
  question: GeneratedQuestion,
  difficulty: DifficultyLevel,
): ValidationGateResult {
  const reasons: string[] = [];
  const checks: Record<string, boolean> = {};
  let passedCount = 0;
  const totalChecks = 8;

  // 1. Prompt present and non-trivial
  const promptOk = Boolean(question.prompt && question.prompt.trim().length >= MIN_PROMPT_LENGTH);
  checks.prompt_present = promptOk;
  if (!promptOk) reasons.push("prompt_missing_or_too_short");
  if (promptOk) passedCount++;

  // 2. Correct answer present
  const answerOk = Boolean(question.correctAnswer && question.correctAnswer.trim().length > 0);
  checks.answer_present = answerOk;
  if (!answerOk) reasons.push("correct_answer_missing");
  if (answerOk) passedCount++;

  // 3. Explanation quality
  const explanationOk = Boolean(
    question.explanation && question.explanation.trim().length >= MIN_EXPLANATION_LENGTH,
  );
  checks.explanation_quality = explanationOk;
  if (!explanationOk) reasons.push("explanation_too_short_or_missing");
  if (explanationOk) passedCount++;

  // 4. Difficulty score in expected range
  const [minScore, maxScore] = DIFFICULTY_SCORE_RANGES[difficulty] ?? [0, 100];
  const difficultyOk =
    question.difficultyScore >= minScore && question.difficultyScore <= maxScore;
  checks.difficulty_score_range = difficultyOk;
  if (!difficultyOk) reasons.push(`difficulty_score_${question.difficultyScore}_out_of_range_${minScore}_${maxScore}`);
  if (difficultyOk) passedCount++;

  // 5. Concepts tested non-empty
  const conceptsOk = Array.isArray(question.conceptsTested) && question.conceptsTested.length > 0;
  checks.concepts_present = conceptsOk;
  if (!conceptsOk) reasons.push("no_concepts_tested");
  if (conceptsOk) passedCount++;

  // 6. Options valid for MCQ-type questions
  let optionsOk = true;
  if (question.options && question.options.length > 0) {
    optionsOk = question.options.length >= 2 && question.options.some(
      (opt) => opt.key === question.correctAnswer || opt.text === question.correctAnswer,
    );
  }
  checks.options_valid = optionsOk;
  if (!optionsOk) reasons.push("options_invalid_or_no_matching_answer");
  if (optionsOk) passedCount++;

  // 7. Source references present (at least one)
  const sourcesOk =
    Array.isArray(question.sourceReferences) && question.sourceReferences.length > 0;
  checks.source_references = sourcesOk;
  if (!sourcesOk) reasons.push("no_source_references");
  if (sourcesOk) passedCount++;

  // 8. Common trap present (educational quality signal)
  const trapOk = Boolean(question.commonTrap && question.commonTrap.trim().length > 0);
  checks.common_trap = trapOk;
  if (!trapOk) reasons.push("no_common_trap");
  if (trapOk) passedCount++;

  const score = Math.round((passedCount / totalChecks) * 100);
  const valid = passedCount === totalChecks;

  return {
    valid,
    score,
    reasons,
    checks,
    retryRecommended: !valid && score >= 50,
    escalationRecommended: !valid && score < 50,
  };
}

/**
 * Full validation gate: structural check + duplicate check + optional LLM validation.
 * Returns the final verdict and whether to retry or escalate.
 */
export async function validationGate(
  question: GeneratedQuestion,
  difficulty: DifficultyLevel,
  existingQuestions: GeneratedQuestion[],
  batchQuestions: GeneratedQuestion[],
  llmValidation?: ValidationReport | null,
): Promise<ValidationGateResult> {
  // Structural validation
  const structural = validateQuestionStructure(question, difficulty);

  // Duplicate detection
  const dup = isDuplicate(question, [...existingQuestions, ...batchQuestions]);
  if (dup.isDuplicate) {
    structural.valid = false;
    structural.checks.not_duplicate = false;
    structural.reasons.push(`duplicate: ${dup.reason}`);
    structural.retryRecommended = false;
    structural.escalationRecommended = false;
  } else {
    structural.checks.not_duplicate = true;
  }

  // LLM validation (if provided)
  if (llmValidation) {
    structural.checks.llm_validated = llmValidation.passed;
    if (!llmValidation.passed) {
      structural.valid = false;
      structural.reasons.push("llm_validation_failed");
      structural.retryRecommended = true;
    }
  }

  return structural;
}
