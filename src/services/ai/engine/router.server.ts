/**
 * WISO Intelligent Router — the single server-side decision point that maps
 * a task + difficulty to an intelligence tier (Luna / Terra / Sol).
 *
 * The frontend NEVER calls this. The frontend NEVER selects a tier.
 * Only server-side engine code imports and uses `routeTask()`.
 */
import {
  BULK_TASK_TYPES,
  SOL_DIRECT_DIFFICULTIES,
  TERRA_DIFFICULTIES,
  TERRA_TASK_TYPES,
  TIER_MODEL_MAP,
  type DifficultyLevel,
  type RoutingDecision,
  type TaskType,
  type TierId,
} from "./config";

export type RouteInput = {
  taskType: TaskType;
  difficulty?: DifficultyLevel;
  bulk?: boolean;
  /** When false, all tasks use the fallback model (current behavior). */
  autoRoutingEnabled: boolean;
  /** Model to use when auto-routing is disabled. */
  fallbackModel: string;
};

/**
 * Deterministic routing rules:
 *
 * - Bulk/preprocessing → Luna
 * - very_hard / nightmare (تعجيزي) → Sol DIRECTLY
 * - basic / medium / hard → Terra
 * - Normal educational tasks (planner, mistakes, performance) → Terra
 * - When auto-routing is off → fallback model (no tier)
 */
export function routeTask(input: RouteInput): RoutingDecision {
  const { taskType, difficulty, bulk, autoRoutingEnabled, fallbackModel } = input;

  if (!autoRoutingEnabled) {
    return {
      tier: "terra",
      model: fallbackModel,
      routingReason: "auto_routing_disabled",
    };
  }

  // Bulk preprocessing always goes to Luna
  if (bulk || BULK_TASK_TYPES.has(taskType)) {
    return {
      tier: "luna",
      model: TIER_MODEL_MAP.luna,
      routingReason: "bulk_preprocessing",
    };
  }

  // تعجيزي / nightmare / very_hard → Sol DIRECTLY, no Terra detour
  if (difficulty && SOL_DIRECT_DIFFICULTIES.has(difficulty)) {
    return {
      tier: "sol",
      model: TIER_MODEL_MAP.sol,
      routingReason: "extreme_difficulty_direct_sol",
    };
  }

  // basic / medium / hard → Terra (with validation + escalation path)
  if (difficulty && TERRA_DIFFICULTIES.has(difficulty)) {
    return {
      tier: "terra",
      model: TIER_MODEL_MAP.terra,
      routingReason: "standard_difficulty_terra",
    };
  }

  // Non-question tasks default to Terra
  if (TERRA_TASK_TYPES.has(taskType)) {
    return {
      tier: "terra",
      model: TIER_MODEL_MAP.terra,
      routingReason: "standard_educational_task",
    };
  }

  // Default fallback
  return {
    tier: "terra",
    model: TIER_MODEL_MAP.terra,
    routingReason: "default_terra",
  };
}

/** Returns the reasoning-effort string for a given tier. */
export function reasoningEffortFor(tier: TierId): "none" | "low" | "medium" | "high" {
  // Re-import here to avoid circular deps at module level
  const { TIER_REASONING_EFFORT } = require("./config") as typeof import("./config");
  return TIER_REASONING_EFFORT[tier];
}
