/**
 * WISO AI Engine — centralized configuration.
 *
 * All tunable parameters live here. No magic numbers in engine code.
 * Tiers (Luna/Terra/Sol) are internal intelligence levels, never exposed
 * to the frontend or selectable by students/admins.
 */

export type TierId = "luna" | "terra" | "sol";

export type TaskType =
  | "questions"
  | "validation"
  | "syllabus"
  | "planner"
  | "mistakes"
  | "performance";

export type RoutingDecision = {
  tier: TierId;
  model: string;
  routingReason: string;
};

/** Maps each tier to its GPT-5.6 model ID. */
export const TIER_MODEL_MAP: Record<TierId, string> = {
  luna: "openai/gpt-5.6-luna",
  terra: "openai/gpt-5.6-terra",
  sol: "openai/gpt-5.6-sol",
};

/** Maps each tier to its reasoning-effort setting for the OpenAI API. */
export const TIER_REASONING_EFFORT: Record<TierId, "none" | "low" | "medium" | "high"> = {
  luna: "none",
  terra: "low",
  sol: "high",
};

/** Maps each tier to its default temperature (GPT-5 family ignores non-default). */
export const TIER_TEMPERATURE: Record<TierId, number> = {
  luna: 1,
  terra: 1,
  sol: 1,
};

/** Maps each tier to its default max output tokens. */
export const TIER_MAX_TOKENS: Record<TierId, number> = {
  luna: 4096,
  terra: 4096,
  sol: 8192,
};

export const ENGINE_CONFIG = {
  /** Max questions per single AI call (sub-batch size). */
  batchSize: 5,
  /** Max Terra retries before escalating to Sol. */
  maxTerraRetries: 1,
  /** Max Sol retries before discarding a question. */
  maxSolRetries: 1,
  /** Jaccard similarity threshold for near-duplicate detection. */
  duplicateSimilarityThreshold: 0.85,
  /** Exact-hash duplicate detection (always on). */
  duplicateExactHash: true,
  /** Request timeout in ms for AI provider calls. */
  requestTimeoutMs: 60_000,
  /** Max total replacement rounds in batch generation. */
  maxReplacementRounds: 3,
} as const;

/** Difficulty values from the database enum / constants. */
export type DifficultyLevel = "basic" | "medium" | "hard" | "very_hard" | "nightmare";

/** Difficulties that route directly to Sol, bypassing Terra entirely. */
export const SOL_DIRECT_DIFFICULTIES: ReadonlySet<DifficultyLevel> = new Set([
  "very_hard",
  "nightmare",
]);

/** Difficulties that go through Terra with validation + retry + escalation. */
export const TERRA_DIFFICULTIES: ReadonlySet<DifficultyLevel> = new Set([
  "basic",
  "medium",
  "hard",
]);

/** Bulk/preprocessing tasks that always route to Luna. */
export const BULK_TASK_TYPES: ReadonlySet<TaskType> = new Set(["syllabus"]);

/** Normal educational tasks that use Terra by default. */
export const TERRA_TASK_TYPES: ReadonlySet<TaskType> = new Set([
  "planner",
  "mistakes",
  "performance",
]);
