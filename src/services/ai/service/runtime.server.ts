/**
 * AI Service Layer.
 *
 * The Study Agent's business logic lives here in provider-neutral form: it
 * builds prompts + JSON schemas, calls the active AIProvider adapter through the
 * registry, records usage, and (when explicitly enabled) fails over to the
 * configured secondary provider. Switching AI_PROVIDER changes nothing below.
 */
import type { AiConfig } from "../config";
import {
  createProvider,
  resolveAiConfig,
  type AiSettingsRow,
} from "../providers/registry.server";
import type {
  AiAttachment,
  AiStructuredResult,
  AIProvider,
  ProviderId,
} from "../providers/types";

export type AgentTask =
  | "syllabus"
  | "planner"
  | "questions"
  | "validation"
  | "mistakes"
  | "performance";

async function loadSettings(): Promise<AiSettingsRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("ai_settings")
    .select(
      "provider, model, temperature, max_tokens, fallback_enabled, fallback_provider, enabled",
    )
    .maybeSingle();
  return (data as AiSettingsRow | null) ?? null;
}

export async function getActiveConfig(): Promise<{
  config: AiConfig;
  enabled: boolean;
}> {
  const settings = await loadSettings();
  return { config: resolveAiConfig(settings), enabled: settings?.enabled ?? true };
}

async function logUsage(entry: {
  userId: string;
  agent: AgentTask;
  provider: ProviderId;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  questionsGenerated?: number;
  documentsAnalyzed?: number;
  imagesAnalyzed?: number;
  status: "ok" | "error";
  error?: string;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_usage_logs").insert({
      user_id: entry.userId,
      agent: entry.agent,
      provider: entry.provider,
      model: entry.model,
      tokens_used: entry.tokensUsed,
      latency_ms: entry.latencyMs,
      questions_generated: entry.questionsGenerated ?? 0,
      documents_analyzed: entry.documentsAnalyzed ?? 0,
      images_analyzed: entry.imagesAnalyzed ?? 0,
      status: entry.status,
      error: entry.error ?? null,
    });
  } catch (error) {
    console.error("[ai] usage logging failed", error);
  }
}

type StructuredCall = {
  system: string;
  user: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  attachments?: AiAttachment[];
};

/**
 * Runs one structured task against the active provider, with optional failover.
 * Never creates cost on a provider unless fallback is explicitly enabled.
 */
export async function runStructuredTask<T>(options: {
  userId: string;
  agent: AgentTask;
  call: StructuredCall;
  counts?: {
    questionsGenerated?: number;
    documentsAnalyzed?: number;
    imagesAnalyzed?: number;
  };
}): Promise<T> {
  const { config, enabled } = await getActiveConfig();
  if (!enabled) throw new Error("AI is disabled by the administrator.");

  const order: ProviderId[] = [config.provider];
  if (config.fallbackEnabled && config.fallbackProvider && config.fallbackProvider !== config.provider) {
    order.push(config.fallbackProvider);
  }

  let lastError: unknown;
  for (const id of order) {
    const provider: AIProvider = createProvider(id, config);
    if (!provider.isConfigured()) {
      lastError = new Error(`Provider "${id}" is not configured.`);
      continue;
    }
    try {
      const result = (await provider.generateStructuredOutput({
        messages: [
          { role: "system", content: options.call.system },
          { role: "user", content: options.call.user },
        ],
        ...(options.call.attachments ? { attachments: options.call.attachments } : {}),
        schemaName: options.call.schemaName,
        jsonSchema: options.call.jsonSchema,
      })) as AiStructuredResult<T>;

      await logUsage({
        userId: options.userId,
        agent: options.agent,
        provider: result.usage.provider,
        model: result.usage.model,
        tokensUsed: result.usage.tokensUsed,
        latencyMs: result.usage.latencyMs,
        status: "ok",
        ...(options.counts ?? {}),
      });
      return result.data;
    } catch (error) {
      lastError = error;
      await logUsage({
        userId: options.userId,
        agent: options.agent,
        provider: id,
        model: config.model,
        tokensUsed: 0,
        latencyMs: 0,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed");
}
