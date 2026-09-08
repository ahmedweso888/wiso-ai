import type { AgentName, AiResult } from "./types";

/** Wraps a secure server-function call into the agents' AiResult contract. */
export async function callAgent<T>(
  agent: AgentName,
  run: () => Promise<T>,
): Promise<AiResult<T>> {
  try {
    return { status: "ok", agent, data: await run() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not configured|disabled by the administrator/i.test(message)) {
      return { status: "not_configured", agent, message };
    }
    return { status: "error", agent, message };
  }
}
