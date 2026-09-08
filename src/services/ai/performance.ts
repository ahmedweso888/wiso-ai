import { callAgent } from "./base";
import { aiPerformanceSnapshot } from "@/lib/ai.functions";
import type { AiResult, PerformanceSnapshot } from "./types";

/** Performance Agent — provider-independent mastery/weak-area analysis. */
export const performanceAgent = {
  name: "performance" as const,

  async snapshot(payload?: unknown): Promise<AiResult<PerformanceSnapshot>> {
    return callAgent("performance", () =>
      aiPerformanceSnapshot({ data: { payload } }),
    );
  },
};
