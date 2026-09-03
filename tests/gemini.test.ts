import {
    generateStudyMaterial,
    GeminiConfigError,
    GeminiRateLimitError,
    GeminiResponseError,
} from "@/lib/gemini";

const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        })),
    };
});

const validPayload = {
    summary: "A summary.",
    keyPoints: ["Point 1", "Point 2"],
    quizQuestions: [
        { question: "Q1?", answer: "A1" },
        { question: "Q2?", answer: "A2" },
        { question: "Q3?", answer: "A3" },
        { question: "Q4?", answer: "A4" },
        { question: "Q5?", answer: "A5" },
    ],
};

describe("generateStudyMaterial", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.GEMINI_API_KEY = "test-key";
        process.env.GEMINI_MODEL = "gemini-test";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("throws GeminiConfigError when API key is missing", async () => {
        delete process.env.GEMINI_API_KEY;
        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiConfigError);
    });

    it("throws GeminiConfigError when model is missing", async () => {
        delete process.env.GEMINI_MODEL;
        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiConfigError);
    });

    it("throws GeminiConfigError when API key is empty", async () => {
        process.env.GEMINI_API_KEY = "   ";
        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiConfigError);
    });

    it("returns validated data for a valid JSON response", async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify(validPayload) },
        });

        const result = await generateStudyMaterial({ title: "T", content: "C" });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.quizQuestions).toHaveLength(5);
            expect(result.data.summary).toBe("A summary.");
        }
    });

    it("throws GeminiResponseError for malformed JSON", async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => "not valid json {" },
        });

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiResponseError);
    });

    it("throws GeminiResponseError for empty response", async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => "" },
        });

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiResponseError);
    });

    it("throws GeminiResponseError when quiz count is wrong", async () => {
        const bad = { ...validPayload, quizQuestions: validPayload.quizQuestions.slice(0, 2) };
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify(bad) },
        });

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiResponseError);
    });

    it("throws GeminiRateLimitError on HTTP 429", async () => {
        const err = new Error("quota exceeded");
        (err as unknown as { status: number }).status = 429;
        mockGenerateContent.mockRejectedValue(err);

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiRateLimitError);
    });

    it("throws GeminiRateLimitError when message mentions quota", async () => {
        const err = new Error("resource has been exhausted");
        mockGenerateContent.mockRejectedValue(err);

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toBeInstanceOf(GeminiRateLimitError);
    });

    it("throws GeminiApiError for generic API failures", async () => {
        mockGenerateContent.mockRejectedValue(new Error("network down"));

        await expect(
            generateStudyMaterial({ title: "T", content: "C" })
        ).rejects.toThrow(/Gemini request failed/);
    });

    it("passes the note content into the prompt", async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify(validPayload) },
        });

        await generateStudyMaterial({
            title: "My Title",
            content: "Specific note content XYZ",
        });

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = mockGenerateContent.mock.calls[0][0] as string;
        expect(prompt).toContain("My Title");
        expect(prompt).toContain("Specific note content XYZ");
    });
});