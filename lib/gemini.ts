import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildStudyMaterialPrompt } from "./gemini-prompt";
import { validateStudyMaterial, type StudyMaterial } from "./gemini-validation";

export class GeminiConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GeminiConfigError";
    }
}

export class GeminiRateLimitError extends Error {
    constructor(message = "Too many requests. Please wait a moment and try again.") {
        super(message);
        this.name = "GeminiRateLimitError";
    }
}

export class GeminiResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GeminiResponseError";
    }
}

export class GeminiApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GeminiApiError";
    }
}

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new GeminiConfigError(
            `Missing required environment variable: ${name}. Please configure it in .env.local.`
        );
    }
    return value;
}

function isRateLimitError(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const e = err as { status?: number; message?: string; error?: { status?: number; message?: string } };
    if (e.status === 429) return true;
    if (e.error?.status === 429) return true;
    const msg = (e.message ?? e.error?.message ?? "").toLowerCase();
    return (
        msg.includes("rate limit") ||
        msg.includes("quota") ||
        msg.includes("resource has been exhausted") ||
        msg.includes("too many requests")
    );
}

export interface GenerateInput {
    title: string;
    content: string;
}

export interface GenerateResult {
    ok: true;
    data: StudyMaterial;
}

/**
 * Generate study material from a note using Google Gemini.
 * This function must only be called from server-side code (Route Handlers, actions, etc.).
 */
export async function generateStudyMaterial(input: GenerateInput): Promise<GenerateResult> {
    const apiKey = getRequiredEnv("GEMINI_API_KEY");
    const model = getRequiredEnv("GEMINI_MODEL");

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
        model,
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const prompt = buildStudyMaterialPrompt({
        title: input.title,
        content: input.content,
    });

    let rawText: string;
    try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        rawText = response.text();
    } catch (err) {
        if (isRateLimitError(err)) {
            throw new GeminiRateLimitError();
        }
        const message = err instanceof Error ? err.message : "Unknown Gemini API error";
        throw new GeminiApiError(`Gemini request failed: ${message}`);
    }

    if (!rawText || rawText.trim() === "") {
        throw new GeminiResponseError("Gemini returned an empty response.");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new GeminiResponseError(
            "Gemini returned a response that could not be parsed as JSON."
        );
    }

    const validation = validateStudyMaterial(parsed);
    if (!validation.ok) {
        throw new GeminiResponseError(
            `Gemini response did not match the expected format: ${validation.error}`
        );
    }

    return { ok: true, data: validation.data };
}