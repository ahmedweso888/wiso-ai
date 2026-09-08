import { callAgent } from "./base";
import { aiAnalyzeDocument } from "@/lib/ai.functions";
import type { AiResult, ExtractedSyllabus } from "./types";

/** Syllabus Agent — provider-independent structured extraction. */
export const syllabusAgent = {
  name: "syllabus" as const,

  async extractSyllabus(documentId: string): Promise<AiResult<ExtractedSyllabus>> {
    return callAgent("syllabus", () =>
      aiAnalyzeDocument({ data: { documentId, kind: "document" } }),
    );
  },

  async understandLesson(documentId: string): Promise<AiResult<ExtractedSyllabus>> {
    return callAgent("syllabus", () =>
      aiAnalyzeDocument({ data: { documentId, kind: "image" } }),
    );
  },
};
