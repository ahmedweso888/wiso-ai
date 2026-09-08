/**
 * WISO Deterministic Duplicate / Near-Duplicate Detection.
 *
 * No LLM calls. Uses Unicode normalization, Arabic text normalization,
 * whitespace/punctuation normalization, tokenization, and Jaccard similarity.
 *
 * Thresholds are configurable via ENGINE_CONFIG.duplicateSimilarityThreshold.
 */
import { ENGINE_CONFIG } from "./config";
import type { GeneratedQuestion } from "../types";

/** Unicode NFC normalization + Arabic-specific normalization. */
export function normalizeText(text: string): string {
  if (!text) return "";

  let result = text.trim().toLowerCase();

  // Unicode NFC normalization
  result = result.normalize("NFC");

  // Arabic normalization: unify forms of Alef, Yaa, Teh Marbuta, etc.
  result = result
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alef variants → bare Alef
    .replace(/\u0649/g, "\u064A")              // Alef Maksura → Yaa
    .replace(/\u0629/g, "\u0647")              // Teh Marbuta → Haa
    .replace(/\u0640/g, "")                    // remove Tatweel
    .replace(/[\u064B-\u0652\u0670]/g, "")      // remove short vowels / superscript alef
    .replace(/\u0651/g, "");                    // remove shadda

  // Whitespace normalization
  result = result.replace(/\s+/g, " ").trim();

  // Punctuation normalization: remove all punctuation
  result = result.replace(/[^\w\u0600-\u06FF\s]/g, " ");
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

/** Tokenize normalized text into a Set of word tokens. */
export function tokenize(text: string): Set<string> {
  const normalized = normalizeText(text);
  if (!normalized) return new Set();
  return new Set(normalized.split(" ").filter((t) => t.length > 0));
}

/** Jaccard similarity between two token sets: |A ∩ B| / |A ∪ B|. */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** SHA-256 hash of normalized text for exact-match detection. */
export function normalizedHash(text: string): string {
  const normalized = normalizeText(text);
  // Simple hash for comparison — not cryptographic, just deterministic.
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

export type DuplicateResult = {
  isDuplicate: boolean;
  reason: string;
  similarity?: number;
  matchedAgainst?: string;
};

/**
 * Checks if a question is a duplicate or near-duplicate of any question
 * in the provided set. Compares normalized prompts.
 */
export function isDuplicate(
  question: GeneratedQuestion,
  others: GeneratedQuestion[],
): DuplicateResult {
  const threshold = ENGINE_CONFIG.duplicateSimilarityThreshold;
  const promptTokens = tokenize(question.prompt);
  const promptHash = normalizedHash(question.prompt);

  for (const other of others) {
    if (!other || other === question) continue;

    // Exact hash match
    if (ENGINE_CONFIG.duplicateExactHash) {
      const otherHash = normalizedHash(other.prompt);
      if (promptHash === otherHash) {
        return {
          isDuplicate: true,
          reason: "exact_match",
          matchedAgainst: other.prompt.slice(0, 80),
        };
      }
    }

    // Jaccard similarity
    const otherTokens = tokenize(other.prompt);
    const similarity = jaccardSimilarity(promptTokens, otherTokens);
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        reason: "near_duplicate",
        similarity,
        matchedAgainst: other.prompt.slice(0, 80),
      };
    }
  }

  return { isDuplicate: false, reason: "unique" };
}

/**
 * Batch dedup: removes duplicates within a single generation batch.
 * Returns the deduplicated array and the list of removed duplicates.
 */
export function deduplicateBatch(
  questions: GeneratedQuestion[],
): { unique: GeneratedQuestion[]; duplicates: GeneratedQuestion[] } {
  const unique: GeneratedQuestion[] = [];
  const duplicates: GeneratedQuestion[] = [];

  for (const q of questions) {
    const dup = isDuplicate(q, unique);
    if (dup.isDuplicate) {
      duplicates.push(q);
    } else {
      unique.push(q);
    }
  }

  return { unique, duplicates };
}
