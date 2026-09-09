/**
 * OpenAI adapter. Uses the OpenAI API when OPENAI_API_KEY is set, otherwise the
 * managed gateway. Unconfigured is a valid state — it stays a placeholder until
 * an admin flips AI_PROVIDER (or the AI settings) to `openai`.
 */
import { BaseProviderAdapter, type ChatRequest, type ChatResponse } from "./base.server";
import { openAiCompatibleChat } from "./openai-compatible.server";
import type { ProviderId } from "./types";

const OPENAI_BASE = "https://api.openai.com/v1";
const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";

export class OpenAIProvider extends BaseProviderAdapter {
  readonly id: ProviderId = "openai";

  private nativeKey() {
    return process.env["OPENAI_API_KEY"] ?? "";
  }

  private gatewayKey() {
    return process.env["LOVABLE_API_KEY"] ?? "";
  }

  isConfigured() {
    return Boolean(this.nativeKey() || this.gatewayKey());
  }

  configurationNote() {
    if (this.nativeKey()) return "OPENAI_API_KEY (environment configured)";
    if (this.gatewayKey()) return "Managed gateway (environment configured)";
    return "Not configured";
  }

  protected chat(request: ChatRequest): Promise<ChatResponse> {
    const key = this.nativeKey();
    if (key) {
      return openAiCompatibleChat(
        { ...request, model: request.model.replace(/^openai\//, "") },
        {
          provider: this.id,
          baseUrl: OPENAI_BASE,
          headers: { Authorization: `Bearer ${key}` },
        },
      );
    }

    const gatewayKey = this.gatewayKey();
    return openAiCompatibleChat(
      {
        ...request,
        model: request.model.includes("/") ? request.model : `openai/${request.model}`,
      },
      {
        provider: this.id,
        baseUrl: GATEWAY_BASE,
        headers: {
          Authorization: `Bearer ${gatewayKey}`,
          "Lovable-API-Key": gatewayKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
      },
    );
  }
}
