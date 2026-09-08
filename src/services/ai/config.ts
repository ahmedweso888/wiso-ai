/**
 * Centralized WISO AI configuration (no secrets). Model names live ONLY here.
 *
 * WISO uses ONE unified AI foundation: the GPT-5.6 family, served through the
 * managed server-side gateway. There is no Model A / Model B routing and no
 * multi-vendor selection — only which GPT-5.6 variant is configured.
 */
import type { ProviderId } from "./providers/types";

export type AiConfig = {
  provider: ProviderId;
  model: string;
  temperature: number;
  maxTokens: number;
  fallbackEnabled: boolean;
  fallbackProvider: ProviderId | null;
};

/** The single WISO default model. */
export const WISO_DEFAULT_MODEL = "openai/gpt-5.6-sol";

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openai: WISO_DEFAULT_MODEL,
};

export const MODEL_CATALOG: Record<ProviderId, { id: string; label: string }[]> = {
  openai: [
    { id: "openai/gpt-5.6-sol", label: "GPT-5.6 Sol — الأقوى" },
    { id: "openai/gpt-5.6-terra", label: "GPT-5.6 Terra — متوازن" },
    { id: "openai/gpt-5.6-luna", label: "GPT-5.6 Luna — سريع واقتصادي" },
  ],
};

/** Every model id WISO is allowed to run. */
export const SUPPORTED_MODEL_IDS = MODEL_CATALOG.openai.map((m) => m.id);

export function normalizeModelId(model?: string | null): string {
  if (!model) return WISO_DEFAULT_MODEL;
  const withVendor = model.includes("/") ? model : `openai/${model}`;
  return SUPPORTED_MODEL_IDS.includes(withVendor) ? withVendor : WISO_DEFAULT_MODEL;
}

export const AI_CONFIG_DEFAULTS = {
  temperature: 1,
  maxTokens: 4096,
} as const;

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openai: "WISO AI (GPT-5.6)",
};
