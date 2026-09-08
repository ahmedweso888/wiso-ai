/**
 * AI agent registry.
 *
 * The AI is composed of specialised agents that communicate through the
 * structured types in `./types`. None of them talks to a model from the
 * browser — each one is a thin, typed seam over the secure server-side
 * WISO AI (GPT-5.6) backend wired through `src/lib/ai.functions.ts`.
 */
export * from "./types";
export { callAgent } from "./base";
export * from "./config";
export { aiStatus } from "@/lib/ai.functions";
export { plannerAgent } from "./planner";
export { syllabusAgent } from "./syllabus";
export { questionsAgent } from "./questions";
export { validationAgent } from "./validation";
export { mistakesAgent } from "./mistakes";
export { performanceAgent } from "./performance";

import { plannerAgent } from "./planner";
import { syllabusAgent } from "./syllabus";
import { questionsAgent } from "./questions";
import { validationAgent } from "./validation";
import { mistakesAgent } from "./mistakes";
import { performanceAgent } from "./performance";

export const agents = {
  planner: plannerAgent,
  syllabus: syllabusAgent,
  questions: questionsAgent,
  validation: validationAgent,
  mistakes: mistakesAgent,
  performance: performanceAgent,
} as const;

export const AGENT_ORDER = [
  "syllabus",
  "planner",
  "questions",
  "validation",
  "mistakes",
  "performance",
] as const;
