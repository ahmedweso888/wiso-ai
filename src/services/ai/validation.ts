import { callAgent } from "./base";
import { aiValidateQuestion } from "@/lib/ai.functions";
import type { AiResult, GeneratedQuestion, ValidationReport } from "./types";

/** Question Validator Agent — provider-independent validation chain. */
export const validationAgent = {
  name: "validation" as const,

  async validate(question: GeneratedQuestion): Promise<AiResult<ValidationReport>> {
    return callAgent("validation", () => aiValidateQuestion({ data: { question } }));
  },

  async validateBatch(
    questions: GeneratedQuestion[],
  ): Promise<AiResult<ValidationReport[]>> {
    return callAgent("validation", async () =>
      Promise.all(
        questions.map((question) => aiValidateQuestion({ data: { question } })),
      ),
    );
  },
};
