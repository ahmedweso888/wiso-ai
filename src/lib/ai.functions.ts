/**
 * Secure seam between the browser and the AI Service Layer.
 * API keys only ever exist inside these handlers (server environment).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
} from "@/services/ai/types";

export const aiStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { getActiveConfig } = await import("@/services/ai/service/runtime.server");
    const { providerStatuses } = await import(
      "@/services/ai/providers/registry.server"
    );
    const { config, enabled } = await getActiveConfig();
    const providers = providerStatuses(config);
    return {
      provider: config.provider,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      fallbackEnabled: config.fallbackEnabled,
      fallbackProvider: config.fallbackProvider,
      enabled,
      configured: providers.some((p) => p.active && p.configured),
      providers,
    };
  });

export const aiGenerateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: QuestionGenerationRequest) => input)
  .handler(async ({ data, context }): Promise<GeneratedQuestion[]> => {
    const { generateQuestionsTask } = await import(
      "@/services/ai/service/tasks.server"
    );
    return generateQuestionsTask(context.userId, data);
  });

export const aiValidateQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { question: GeneratedQuestion }) => input)
  .handler(async ({ data, context }): Promise<ValidationReport> => {
    const { validateQuestionTask } = await import(
      "@/services/ai/service/tasks.server"
    );
    return validateQuestionTask(context.userId, data.question);
  });

export const aiGeneratePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlannerRequest) => input)
  .handler(async ({ data, context }): Promise<GeneratedPlan> => {
    const { generatePlanTask } = await import("@/services/ai/service/tasks.server");
    return generatePlanTask(context.userId, data);
  });

export const aiAnalyzeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { documentId: string; text?: string; kind: "document" | "image" }) =>
      input,
  )
  .handler(async ({ data, context }): Promise<ExtractedSyllabus> => {
    const { analyzeDocumentTask } = await import(
      "@/services/ai/service/tasks.server"
    );
    return analyzeDocumentTask(context.userId, data);
  });

export const aiAnalyzeMistakes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: MistakeAnalysisRequest) => input)
  .handler(async ({ data, context }): Promise<MistakeAnalysis[]> => {
    const { analyzeMistakesTask } = await import(
      "@/services/ai/service/tasks.server"
    );
    return analyzeMistakesTask(context.userId, data);
  });

export const aiPerformanceSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { payload?: unknown }) => input)
  .handler(async ({ data, context }): Promise<PerformanceSnapshot> => {
    const { performanceTask } = await import("@/services/ai/service/tasks.server");
    return performanceTask(context.userId, data.payload);
  });
