/**
 * Structured contracts for the AI layer.
 *
 * These types describe exactly what the backend AI service must return.
 * The secure backend (server function -> WISO AI / GPT-5.6) returns payloads
 * matching these shapes. Nothing in this file calls a model directly.
 */

import type { Difficulty, MistakeType, QuestionType } from "@/lib/constants";

export type AgentName =
  | "planner"
  | "syllabus"
  | "questions"
  | "validation"
  | "mistakes"
  | "performance";

export type AiServiceStatus = "not_configured" | "ok" | "error";

export type AiResult<T> =
  | { status: "ok"; agent: AgentName; data: T }
  | { status: "not_configured"; agent: AgentName; message: string }
  | { status: "error"; agent: AgentName; message: string };

export type SourceReference = {
  documentId: string | null;
  documentName?: string;
  pageNumber: number | null;
  quote?: string;
};

/* ------------------------------------------------------------------ */
/* Syllabus extraction pipeline                                        */
/* ------------------------------------------------------------------ */

export type ExtractedLearningObjective = {
  statement: string;
  bloomLevel?: string;
};

export type ExtractedConcept = {
  title: string;
  description?: string;
  difficulty: Difficulty;
  learningObjectives: ExtractedLearningObjective[];
  sourceReferences: SourceReference[];
};

export type ExtractedTopic = {
  title: string;
  estimatedMinutes: number;
  concepts: ExtractedConcept[];
};

export type ExtractedChapter = {
  title: string;
  pageFrom: number | null;
  pageTo: number | null;
  topics: ExtractedTopic[];
};

export type ExtractedUnit = {
  title: string;
  chapters: ExtractedChapter[];
};

export type ExtractedSyllabus = {
  subjectSlug: string;
  documentId: string;
  units: ExtractedUnit[];
};

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export type PlanLevel = "year" | "month" | "week" | "day" | "session";

export type GeneratedPlanItem = {
  level: PlanLevel;
  phase: "syllabus" | "revision";
  title: string;
  notes?: string;
  subjectSlug?: string;
  topicId?: string | null;
  startsOn: string;
  endsOn: string;
  estimatedMinutes: number;
  questionTarget: number;
  targetDifficulty: Difficulty;
  children?: GeneratedPlanItem[];
};

export type GeneratedPlan = {
  deadline: string;
  dailyHoursTarget: number;
  items: GeneratedPlanItem[];
};

export type PlannerRequest = {
  deadline: string;
  dailyHoursTarget: number;
  subjectSlugs: string[];
  performanceSnapshot?: PerformanceSnapshot;
};

/* ------------------------------------------------------------------ */
/* Question generation                                                 */
/* ------------------------------------------------------------------ */

export type QuestionGenerationRequest = {
  subjectSlug: string;
  topicIds: string[];
  difficulties: Difficulty[];
  questionTypes: QuestionType[];
  count: number;
  /** Nightmare mode: depth, transfer, hidden assumptions — never artificial length. */
  nightmareMode: boolean;
  /** Concept ids to attack, produced by the mistake analyzer. */
  targetConceptIds?: string[];
  /** Question ids the student already solved; must not be repeated. */
  excludeQuestionIds?: string[];
  language: "ar" | "en";
};

export type GeneratedQuestion = {
  prompt: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  difficultyScore: number;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  conceptsTested: string[];
  commonTrap: string;
  estimatedTimeSeconds: number;
  sourceReferences: SourceReference[];
};

/* ------------------------------------------------------------------ */
/* Validation pipeline                                                 */
/* ------------------------------------------------------------------ */

export type ValidationCheck =
  | "question_wellformed"
  | "answer_valid"
  | "single_correct_answer"
  | "explanation_consistent"
  | "within_syllabus"
  | "not_duplicate"
  | "difficulty_meaningful";

export type ValidationReport = {
  passed: boolean;
  checks: { check: ValidationCheck; passed: boolean; note?: string }[];
};

/* ------------------------------------------------------------------ */
/* Mistake analysis                                                    */
/* ------------------------------------------------------------------ */

export type MistakeAnalysisRequest = {
  attempts: {
    questionId: string;
    answerGiven: string;
    correctAnswer: string;
    timeTakenSeconds: number;
  }[];
};

export type MistakeAnalysis = {
  questionId: string;
  mistakeType: MistakeType;
  analysis: string;
  weakConceptIds: string[];
};

/* ------------------------------------------------------------------ */
/* Performance                                                         */
/* ------------------------------------------------------------------ */

export type PerformanceSnapshot = {
  overallMastery: number;
  accuracy: number;
  questionsSolved: number;
  hardSolved: number;
  nightmareSolved: number;
  averageTimeSeconds: number;
  weakConcepts: { conceptId: string; title: string; masteryScore: number }[];
};
