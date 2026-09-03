import {
    validateStudyMaterial,
    studyMaterialSchema,
} from "@/lib/gemini-validation";

describe("Gemini response validation", () => {
    const validMaterial = {
        summary: "This note covers the basics of photosynthesis.",
        keyPoints: [
            "Photosynthesis converts light into chemical energy",
            "It occurs in chloroplasts",
            "Oxygen is a byproduct",
        ],
        quizQuestions: [
            { question: "Where does photosynthesis occur?", answer: "In chloroplasts" },
            { question: "What is the main input?", answer: "Light energy" },
            { question: "What gas is released?", answer: "Oxygen" },
            { question: "What pigment captures light?", answer: "Chlorophyll" },
            { question: "What is the sugar produced?", answer: "Glucose" },
        ],
    };

    it("accepts a valid structured response", () => {
        const result = validateStudyMaterial(validMaterial);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.summary).toBe(validMaterial.summary);
            expect(result.data.keyPoints).toHaveLength(3);
            expect(result.data.quizQuestions).toHaveLength(5);
        }
    });

    it("rejects a response with fewer than 5 quiz questions", () => {
        const bad = {
            ...validMaterial,
            quizQuestions: validMaterial.quizQuestions.slice(0, 3),
        };
        const result = validateStudyMaterial(bad);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toMatch(/5 quiz questions/i);
        }
    });

    it("rejects a response with more than 5 quiz questions", () => {
        const bad = {
            ...validMaterial,
            quizQuestions: [
                ...validMaterial.quizQuestions,
                { question: "Extra?", answer: "Extra." },
            ],
        };
        const result = validateStudyMaterial(bad);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toMatch(/5 quiz questions/i);
        }
    });

    it("rejects a response with an empty summary", () => {
        const bad = { ...validMaterial, summary: "" };
        const result = validateStudyMaterial(bad);
        expect(result.ok).toBe(false);
    });

    it("rejects a response with an empty key point", () => {
        const bad = { ...validMaterial, keyPoints: ["ok", ""] };
        const result = validateStudyMaterial(bad);
        expect(result.ok).toBe(false);
    });

    it("rejects a quiz question with an empty answer", () => {
        const bad = {
            ...validMaterial,
            quizQuestions: [
                { question: "Q?", answer: "" },
                ...validMaterial.quizQuestions.slice(1),
            ],
        };
        const result = validateStudyMaterial(bad);
        expect(result.ok).toBe(false);
    });

    it("rejects completely unrelated JSON", () => {
        const result = validateStudyMaterial({ foo: "bar" });
        expect(result.ok).toBe(false);
    });

    it("rejects non-object input", () => {
        expect(validateStudyMaterial("not json").ok).toBe(false);
        expect(validateStudyMaterial(null).ok).toBe(false);
        expect(validateStudyMaterial(42).ok).toBe(false);
        expect(validateStudyMaterial([]).ok).toBe(false);
    });

    it("exposes a Zod schema for direct use", () => {
        const parsed = studyMaterialSchema.safeParse(validMaterial);
        expect(parsed.success).toBe(true);
    });
});