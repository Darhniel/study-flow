import { NextRequest, NextResponse } from "next/server";
import {
    generateStudyMaterial,
    GeminiConfigError,
    GeminiRateLimitError,
    GeminiResponseError,
    GeminiApiError,
} from "@/lib/gemini";

interface RequestBody {
    noteId?: string;
    title?: string;
    content?: string;
}

export async function POST(request: NextRequest) {
    let body: RequestBody;
    try {
        body = (await request.json()) as RequestBody;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON in request body." },
            { status: 400 }
        );
    }

    const { title, content, noteId } = body;

    if (typeof title !== "string" || title.trim() === "") {
        return NextResponse.json(
            { error: "Note title is required." },
            { status: 400 }
        );
    }
    if (typeof content !== "string" || content.trim() === "") {
        return NextResponse.json(
            { error: "Note content is required." },
            { status: 400 }
        );
    }
    if (typeof noteId !== "string" || noteId.trim() === "") {
        return NextResponse.json(
            { error: "Note ID is required." },
            { status: 400 }
        );
    }

    try {
        const result = await generateStudyMaterial({
            title: title.trim(),
            content: content.trim(),
        });
        return NextResponse.json({ ok: true, data: result.data, noteId });
    } catch (err) {
        if (err instanceof GeminiConfigError) {
            return NextResponse.json(
                { error: err.message, code: "CONFIG_ERROR" },
                { status: 500 }
            );
        }
        if (err instanceof GeminiRateLimitError) {
            return NextResponse.json(
                { error: err.message, code: "RATE_LIMIT" },
                { status: 429 }
            );
        }
        if (err instanceof GeminiResponseError) {
            return NextResponse.json(
                { error: err.message, code: "INVALID_RESPONSE" },
                { status: 502 }
            );
        }
        if (err instanceof GeminiApiError) {
            return NextResponse.json(
                { error: err.message, code: "API_ERROR" },
                { status: 502 }
            );
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json(
            { error: `Generation failed: ${message}`, code: "UNKNOWN" },
            { status: 500 }
        );
    }
}