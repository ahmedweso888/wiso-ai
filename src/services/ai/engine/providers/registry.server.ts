/**
 * Provider registry + active-config resolution.
 *
 * WISO has ONE AI foundation (the GPT-5.6 family behind the managed gateway).
 * Resolution order for the model: admin AI settings row (database) ->
 * environment (WISO_AI_MODEL / OPENAI_MODEL) -> code default. Any legacy value
 * (Gemini/Anthropic/Model A/Model B) is normalized to the WISO default.
 * API keys are read from the server environment ONLY and never leave this layer.
 */
import {
  AI_CONFIG_DEFAULTS,
  DEFAULT_MODELS,
  normalizeModelId,
  type AiConfig,
} from "../config";
import { OpenAIProvider } from "./openai.server";
import { PROVIDER_IDS, type AIProvider, type ProviderId } from "./types";

export function envProvider(): ProviderId {
  return "openai";
}

function envModel(): string | undefined {
  return process.env["WISO_AI_MODEL"] || process.env["OPENAI_MODEL"] || undefined;
}

export type AiSettingsRow = {
  provider: string;
  model: string;
  temperature: number | string;
  max_tokens: number;
  fallback_enabled: boolean;
  fallback_provider: string | null;
  enabled: boolean;
  auto_routing_enabled?: boolean;
};

export function resolveAiConfig(settings?: AiSettingsRow | null): AiConfig {
  const provider = envProvider();
  const model = normalizeModelId(settings?.model || envModel() || DEFAULT_MODELS[provider]);
  return {
    provider,
    model,
    temperature: settings ? Number(settings.temperature) : AI_CONFIG_DEFAULTS.temperature,
    maxTokens: settings?.max_tokens ?? AI_CONFIG_DEFAULTS.maxTokens,
    // Single-provider architecture: no cross-vendor failover.
    fallbackEnabled: false,
    fallbackProvider: null,
  };
}

export function createProvider(_id: ProviderId, config: AiConfig): AIProvider {
  return new OpenAIProvider({
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });
}

export function providerStatuses(config: AiConfig) {
  return PROVIDER_IDS.map((id) => {
    const provider = createProvider(id, config);
    return {
      id,
      configured: provider.isConfigured(),
      note: provider.configurationNote(),
      active: true,
    };
  });
}
