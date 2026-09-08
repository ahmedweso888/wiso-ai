/**
 * AI Service Layer.
 *
 * The Study Agent's business logic lives here in provider-neutral form: it
 * builds prompts + JSON schemas, calls the active AIProvider adapter through the
 * registry, records usage, and (when explicitly enabled) fails over to the
 * configured secondary provider. Switching AI_PROVIDER changes nothing below.
 *
 * WISO Engine integration: the intelligent router selects the tier/model
 * for each call, and usage logging tracks the tier and request ID.
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
import { routeTask, type RouteInput } from "../engine/router.server";
import { generateRequestId, logAiEvent } from "../engine/logging.server";
import type { TierId, TaskType } from "../engine/config";

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
      "provider, model, temperature, max_tokens, fallback_enabled, fallback_provider, enabled, auto_routing_enabled",
    )
    .maybeSingle();
  return (data as AiSettingsRow | null) ?? null;
}

export async function getActiveConfig(): Promise<{
  config: AiConfig;
  enabled: boolean;
  autoRoutingEnabled: boolean;
}> {
  const settings = await loadSettings();
  return {
    config: resolveAiConfig(settings),
    enabled: settings?.enabled ?? true,
    autoRoutingEnabled: settings?.auto_routing_enabled ?? true,
  };
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
  tier?: TierId;
  requestId?: string;
  questionsApproved?: number;
  questionsRejected?: number;
  retries?: number;
  escalations?: number;
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
      ...(entry.tier ? { tier: entry.tier } : {}),
      ...(entry.requestId ? { request_id: entry.requestId } : {}),
      questions_approved: entry.questionsApproved ?? 0,
      questions_rejected: entry.questionsRejected ?? 0,
      retries: entry.retries ?? 0,
      escalations: entry.escalations ?? 0,
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

type RunOptions = {
  userId: string;
  agent: AgentTask;
  call: StructuredCall;
  counts?: {
    questionsGenerated?: number;
    documentsAnalyzed?: number;
    imagesAnalyzed?: number;
  };
  /** Difficulty hint for the router (question generation only). */
  difficulty?: string;
  /** Whether this is a bulk/preprocessing task. */
  bulk?: boolean;
  /** Override the model (when caller has already routed). */
  overrideModel?: string;
  /** Override the tier (when caller has already routed). */
  overrideTier?: TierId;
};

/**
 * Runs one structured task against the active provider, with optional failover.
 * Never creates cost on a provider unless fallback is explicitly enabled.
 *
 * When auto-routing is enabled, the WISO router selects the tier and model
 * based on task type and difficulty. When disabled, uses the configured model.
 */
export async function runStructuredTask<T>(options: RunOptions): Promise<T> {
  const { config, enabled, autoRoutingEnabled } = await getActiveConfig();
  if (!enabled) throw new Error("AI is disabled by the administrator.");

  const requestId = generateRequestId();

  // Route to the correct tier/model
  const routingInput: RouteInput = {
    taskType: options.agent as TaskType,
    difficulty: options.difficulty as RouteInput["difficulty"],
    bulk: options.bulk,
    autoRoutingEnabled,
    fallbackModel: config.model,
  };
  const routing = routeTask(routingInput);

  const tier = options.overrideTier ?? routing.tier;
  const model = options.overrideModel ?? routing.model;

  logAiEvent({
    requestId,
    userId: options.userId,
    taskType: options.agent,
    tier,
    model,
    status: "starting",
  });

  const order: ProviderId[] = [config.provider];
  if (config.fallbackEnabled && config.fallbackProvider && config.fallbackProvider !== config.provider) {
    order.push(config.fallbackProvider);
  }

  let lastError: unknown;
  for (const id of order) {
    const provider: AIProvider = createProvider(id, { ...config, model });
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
        tier,
        requestId,
        ...(options.counts ?? {}),
      });
      return result.data;
    } catch (error) {
      lastError = error;
      await logUsage({
        userId: options.userId,
        agent: options.agent,
        provider: id,
        model,
        tokensUsed: 0,
        latencyMs: 0,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        tier,
        requestId,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed");
}
