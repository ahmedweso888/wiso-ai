import { callAgent } from "./base";
import { aiAnalyzeMistakes } from "@/lib/ai.functions";
import type { AiResult, MistakeAnalysis, MistakeAnalysisRequest } from "./types";

/** Mistake Analyzer Agent — provider-independent. */
export const mistakesAgent = {
  name: "mistakes" as const,

  async analyze(
    request: MistakeAnalysisRequest,
  ): Promise<AiResult<MistakeAnalysis[]>> {
    return callAgent("mistakes", () => aiAnalyzeMistakes({ data: request }));
  },
};
