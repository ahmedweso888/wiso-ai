import { callAgent } from "./base";
import { aiGenerateQuestions } from "@/lib/ai.functions";
import type { AiResult, GeneratedQuestion, QuestionGenerationRequest } from "./types";

/** Question Generator Agent — provider-independent (see service layer prompts). */
export const questionsAgent = {
  name: "questions" as const,

  async generate(
    request: QuestionGenerationRequest,
  ): Promise<AiResult<GeneratedQuestion[]>> {
    return callAgent("questions", () => aiGenerateQuestions({ data: request }));
  },

  async attackWeaknesses(
    request: QuestionGenerationRequest,
  ): Promise<AiResult<GeneratedQuestion[]>> {
    return callAgent("questions", () =>
      aiGenerateQuestions({ data: { ...request, nightmareMode: true } }),
    );
  },
};
