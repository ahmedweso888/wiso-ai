/**
 * Provider-agnostic AI contracts.
 *
 * Nothing in this file mentions a concrete vendor SDK. The Study Agent talks
 * only to these types, so the planner, syllabus, question, validation,
 * mistake and performance agents never depend on the configured GPT-5.6
 * variant or the gateway that serves it.
 */

import type { GeneratedQuestion, ValidationReport } from "../types";

export const PROVIDER_IDS = ["openai"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type AiRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiRole;
  content: string;
};

/** Multimodal input: an image page or a document rendered/encoded as base64. */
export type AiAttachment = {
  mimeType: string;
  dataBase64: string;
  name?: string;
};

export type AiCallOptions = {
  temperature?: number;
  maxTokens?: number;
  /** Overrides the configured model for this single call. */
  model?: string;
};

export type GenerateTextInput = AiCallOptions & {
  messages: AiMessage[];
  attachments?: AiAttachment[];
};

export type GenerateStructuredInput = GenerateTextInput & {
  schemaName: string;
  /** JSON Schema describing the normalized shape the core app expects. */
  jsonSchema: Record<string, unknown>;
};

export type AiUsage = {
  provider: ProviderId;
  model: string;
  tokensUsed: number;
  latencyMs: number;
};

export type AiTextResult = {
  text: string;
  usage: AiUsage;
};

export type AiStructuredResult<T> = {
  data: T;
  usage: AiUsage;
};

export type AnalyzeDocumentInput = AiCallOptions & {
  instruction: string;
  attachments: AiAttachment[];
  schemaName: string;
  jsonSchema: Record<string, unknown>;
};

/**
 * The single interface every provider adapter implements.
 * Adapters MUST return already-normalized data — never raw vendor payloads.
 */
export interface AIProvider {
  readonly id: ProviderId;
  /** True when credentials for this provider are available server-side. */
  isConfigured(): boolean;
  /** Human-readable note about how it is configured (never contains a key). */
  configurationNote(): string;

  generateText(input: GenerateTextInput): Promise<AiTextResult>;
  generateStructuredOutput<T>(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<T>>;
  analyzeImage<T>(input: AnalyzeDocumentInput): Promise<AiStructuredResult<T>>;
  analyzeDocument<T>(input: AnalyzeDocumentInput): Promise<AiStructuredResult<T>>;
  generateQuestions(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<GeneratedQuestion[]>>;
  validateQuestion(
    input: GenerateStructuredInput,
  ): Promise<AiStructuredResult<ValidationReport>>;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly provider: ProviderId,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
