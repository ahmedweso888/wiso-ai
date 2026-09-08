/**
 * Product-wide constants. The whole planner is anchored to this deadline.
 */
export const SYLLABUS_DEADLINE = new Date("2027-01-01T00:00:00Z");

export const DIFFICULTY_LEVELS = [
  "basic",
  "medium",
  "hard",
  "very_hard",
  "nightmare",
] as const;
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

/** Default generation mode heavily prioritises the top three tiers. */
export const EXTREME_DIFFICULTIES: Difficulty[] = ["hard", "very_hard", "nightmare"];

export const QUESTION_TYPES = [
  "mcq",
  "true_false",
  "short_answer",
  "explain_why",
  "compare",
  "problem_solving",
  "error_detection",
  "output_prediction",
  "coding",
  "debugging",
  "algorithm_design",
  "mixed_concept",
  "trap",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Question types that only make sense for the programming subjects. */
export const PROGRAMMING_QUESTION_TYPES: QuestionType[] = [
  "output_prediction",
  "debugging",
  "coding",
  "algorithm_design",
  "error_detection",
];

export const MISTAKE_TYPES = [
  "knowledge_gap",
  "careless",
  "misunderstanding",
  "calculation",
  "logic",
  "reading",
  "misconception",
  "coding_error",
  "syntax_error",
  "algorithmic_error",
] as const;
export type MistakeType = (typeof MISTAKE_TYPES)[number];

export const ACCESS_DURATION_PRESETS = [
  { days: 1, key: "1d" },
  { days: 3, key: "3d" },
  { days: 7, key: "7d" },
  { days: 14, key: "14d" },
  { days: 30, key: "30d" },
  { days: 90, key: "90d" },
  { days: 365, key: "1y" },
] as const;

export const STORAGE_BUCKET = "study-materials";
