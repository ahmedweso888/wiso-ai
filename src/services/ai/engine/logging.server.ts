/**
 * WISO Request ID generator and structured logging.
 *
 * Every AI operation gets a unique request ID for observability.
 * Structured logs go to console (picked up by the error-capture pipeline).
 */
import { randomUUID } from "crypto";

export function generateRequestId(): string {
  return `wiso_${randomUUID()}`;
}

export type LogContext = {
  requestId: string;
  userId?: string;
  taskType?: string;
  tier?: string;
  model?: string;
  status?: string;
  latencyMs?: number;
  tokensUsed?: number;
  questionsGenerated?: number;
  questionsApproved?: number;
  questionsRejected?: number;
  retries?: number;
  escalations?: number;
  error?: string;
};

/** Structured log — never logs secrets, API keys, or auth tokens. */
export function logAiEvent(context: LogContext): void {
  const entry = Object.entries(context)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");

  const level = context.status === "error" ? "error" : "info";
  const prefix = `[wiso:${context.requestId?.slice(0, 12) ?? "unknown"}]`;

  if (level === "error") {
    console.error(`${prefix} ${entry}`);
  } else {
    console.log(`${prefix} ${entry}`);
  }
}
