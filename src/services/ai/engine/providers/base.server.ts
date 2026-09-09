/**
 * Shared adapter base. Every provider only has to implement `chat()`;
 * structured output, image/document analysis, question generation and
 * validation are derived here so the behaviour is identical across providers.
 */
import type {
  AIProvider,
  AiAttachment,
  AiMessage,
  AiStructuredResult,
  AiTextResult,
  AnalyzeDocumentInput,
  GenerateStructuredInput,
  GenerateTextInput,
  ProviderId,
} from "./types";
import { AiProviderError } from "./types";
import type { GeneratedQuestion, ValidationReport } from "../types";

export type ChatRequest = {
  messages: AiMessage[];
  attachments?: AiAttachment[];
  temperature: number;
  maxTokens: number;
  model: string;
  /** When set, the provider must return JSON matching this schema. */
  jsonSchema?: { name: string; schema: Record<string, unknown> };
};

export type ChatResponse = {
  text: string;
  tokensUsed: number;
};

export function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.search(/[[{]/);
    const last = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("Provider did not return parsable JSON");
  }
}

export abstract class BaseProviderAdapter implements AIProvider {
  abstract readonly id: ProviderId;

  constructor(
    protected readonly defaults: {
      model: string;
      temperature: number;
      maxTokens: number;
    },
  ) {}

  abstract isConfigured(): boolean;
  abstract configurationNote(): string;
  protected abstract chat(request: ChatRequest): Promise<ChatResponse>;

  protected assertConfigured() {
    if (!this.isConfigured()) {
      throw new AiProviderError(
        `Provider "${this.id}" is not configured on the server.`,
        this.id,
      );
    }
  }

  private resolve(input: GenerateTextInput) {
    return {
      model: input.model ?? this.defaults.model,
      temperature: input.temperature ?? this.defaults.temperature,
      maxTokens: input.maxTokens ?? this.defaults.maxTokens,
    };
  }

  async generateText(input: GenerateTextInput): Promise<AiTextResult> {
    this.assertConfigured();
    const resolved = this.resolve(input);
    const startedAt = Date.now();
    const response = await this.chat({
      messages: input.messages,
      ...(input.attachments ? { attachments: input.attachments } : {}),
      ...resolved,
    });
    return {
      text: response.text,
      usage: {
        provider: this.id,
        model: resolved.model,
        tokensUsed: response.tokensUsed,
        latencyMs: Date.now() - startedAt,
      },
    };
  }

  async generateStructuredOutput<T>(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<T>> {
    this.assertConfigured();
    const resolved = this.resolve(input);
    const startedAt = Date.now();
    const response = await this.chat({
      messages: input.messages,
      ...(input.attachments ? { attachments: input.attachments } : {}),
      ...resolved,
      jsonSchema: { name: input.schemaName, schema: input.jsonSchema },
    });
    return {
      data: extractJson(response.text) as T,
      usage: {
        provider: this.id,
        model: resolved.model,
        tokensUsed: response.tokensUsed,
        latencyMs: Date.now() - startedAt,
      },
    };
  }

  analyzeImage<T>(input: AnalyzeDocumentInput): Promise<AiStructuredResult<T>> {
    return this.analyzeAttachments<T>(input);
  }

  analyzeDocument<T>(input: AnalyzeDocumentInput): Promise<AiStructuredResult<T>> {
    return this.analyzeAttachments<T>(input);
  }

  private analyzeAttachments<T>(
    input: AnalyzeDocumentInput,
  ): Promise<AiStructuredResult<T>> {
    return this.generateStructuredOutput<T>({
      messages: [{ role: "user", content: input.instruction }],
      attachments: input.attachments,
      schemaName: input.schemaName,
      jsonSchema: input.jsonSchema,
      ...(input.model ? { model: input.model } : {}),
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxTokens !== undefined ? { maxTokens: input.maxTokens } : {}),
    });
  }

  generateQuestions(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<GeneratedQuestion[]>> {
    return this.generateStructuredOutput<GeneratedQuestion[]>(input);
  }

  validateQuestion(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<ValidationReport>> {
    return this.generateStructuredOutput<ValidationReport>(input);
  }
}
