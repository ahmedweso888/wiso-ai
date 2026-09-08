import { callAgent } from "./base";
import { aiGeneratePlan } from "@/lib/ai.functions";
import type { AiResult, GeneratedPlan, PlannerRequest } from "./types";

/** Planner Agent — provider-independent; talks only to the AI service layer. */
export const plannerAgent = {
  name: "planner" as const,

  async generatePlan(request: PlannerRequest): Promise<AiResult<GeneratedPlan>> {
    return callAgent("planner", () => aiGeneratePlan({ data: request }));
  },

  async adaptPlan(request: PlannerRequest): Promise<AiResult<GeneratedPlan>> {
    return callAgent("planner", () => aiGeneratePlan({ data: request }));
  },
};
