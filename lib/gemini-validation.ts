import { z } from "zod";

export const quizQuestionSchema = z.object({
    question: z.string().min(1, "Question cannot be empty"),
    answer: z.string().min(1, "Answer cannot be empty"),
});

export const studyMaterialSchema = z.object({
    summary: z.string().min(1, "Summary cannot be empty"),
    keyPoints: z.array(z.string().min(1)).min(1, "At least one key point is required"),
    quizQuestions: quizQuestionSchema
        .array()
        .length(5, "Exactly 5 quiz questions are required"),
});

export type StudyMaterial = z.infer<typeof studyMaterialSchema>;

export type ValidationResult =
    | { ok: true; data: StudyMaterial }
    | { ok: false; error: string };

export function validateStudyMaterial(raw: unknown): ValidationResult {
    const result = studyMaterialSchema.safeParse(raw);
    if (result.success) {
        return { ok: true, data: result.data };
    }
    const firstIssue = result.error.issues[0];
    const message = firstIssue
        ? `${firstIssue.path.join(".") || "response"}: ${firstIssue.message}`
        : "Invalid response format";
    return { ok: false, error: message };
}