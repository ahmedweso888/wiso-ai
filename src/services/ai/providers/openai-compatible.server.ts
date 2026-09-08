/**
 * Shared transport for OpenAI-compatible chat APIs (OpenAI itself and the
 * managed Lovable AI Gateway, used when no vendor key is configured).
 * Keeps HTTP details out of the agents.
 */
import type { ChatRequest, ChatResponse } from "./base.server";
import { AiProviderError, type AiAttachment, type ProviderId } from "./types";

type OpenAiContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

function toDataUrl(attachment: AiAttachment) {
  return `data:${attachment.mimeType};base64,${attachment.dataBase64}`;
}

export async function openAiCompatibleChat(
  request: ChatRequest,
  transport: {
    provider: ProviderId;
    baseUrl: string;
    headers: Record<string, string>;
  },
): Promise<ChatResponse> {
  const messages = request.messages.map((message, index) => {
    const isLastUser =
      message.role === "user" && index === request.messages.length - 1;
    if (!isLastUser || !request.attachments?.length) {
      return { role: message.role, content: message.content };
    }
    const parts: OpenAiContentPart[] = [
      { type: "text", text: message.content },
      ...request.attachments.map((attachment) => ({
        type: "image_url" as const,
        image_url: { url: toDataUrl(attachment) },
      })),
    ];
    return { role: message.role, content: parts };
  });

  const isGpt5 = /(^|\/)gpt-5/.test(request.model);
  const body: Record<string, unknown> = {
    model: request.model,
    messages,
    max_completion_tokens: request.maxTokens,
  };

  // GPT-5 family rejects non-default temperature; GPT-5.6 needs reasoning off
  // on the chat-completions path (required when JSON schemas / tools are used).
  if (!isGpt5) body["temperature"] = request.temperature;
  if (/gpt-5\.6/.test(request.model)) body["reasoning_effort"] = "none";

  if (request.jsonSchema) {
    body["response_format"] = {
      type: "json_schema",
      json_schema: {
        name: request.jsonSchema.name,
        schema: request.jsonSchema.schema,
      },
    };
  }

  const response = await fetch(`${transport.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...transport.headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AiProviderError(
      `${transport.provider} request failed (${response.status}): ${detail.slice(0, 400)}`,
      transport.provider,
      response.status,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };

  return {
    text: payload.choices?.[0]?.message?.content ?? "",
    tokensUsed: payload.usage?.total_tokens ?? 0,
  };
}
