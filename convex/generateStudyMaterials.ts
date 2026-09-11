import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";
import { requireAuth } from "./authHelpers";
import { validateStudyMaterial } from "../lib/gemini-validation";

export const generate = action({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    console.log(`[Gemini Action] Starting generation for note: ${args.noteId}`);
    
    const userId = await requireAuth(ctx);
    const note = await ctx.runQuery(api.notes.get, { id: args.noteId });
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or unauthorized");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in Convex env");
    
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    console.log(`[Gemini Action] Using model: ${model}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: { responseMimeType: "application/json" },
    });

    const textPrompt = `You are an expert educational assistant. Analyze the student's study note below and produce study material.
STRICT RULES:
- Use ONLY information contained in the note or attached files. Do not invent facts.
- Be concise, clear, and educational.
- Produce exactly 5 quiz questions with answers.
Return valid JSON:
{
  "summary": "string",
  "keyPoints": ["string"],
  "quizQuestions": [{ "question": "string", "answer": "string" }]
}
Note title: ${note.title}
Note content: ${note.content || "(No text content, see attachment)"}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parts: any[] = [{ text: textPrompt }];

    if (note.attachmentId) {
      console.log(`[Gemini Action] Fetching attachment: ${note.attachmentId}`);
      const file = await ctx.storage.get(note.attachmentId);
      
      if (!file) {
        throw new Error("Attachment file not found in storage");
      }

      const buffer = await file.arrayBuffer();
      
      // 1. Enforce a 10MB limit to prevent connection drops from massive payloads
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (buffer.byteLength > maxSize) {
        throw new Error("Attached file is too large (max 10MB). Please upload a smaller file or compress it.");
      }
      
      console.log(`[Gemini Action] File size: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

      const mimeType = note.attachmentType || "application/octet-stream";
      
      // 2. Use standard Web API for base64 (safer in Convex's V8 isolate than Node's Buffer)
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
      console.log(`[Gemini Action] Attachment added to prompt. Total parts: ${parts.length}`);
    }

    try {
      console.log("[Gemini Action] Sending request to Google Generative AI...");
      const result = await geminiModel.generateContent(parts);
      console.log("[Gemini Action] Received response from Google Generative AI");
      
      const rawText = result.response.text();
      console.log(`[Gemini Action] Raw response length: ${rawText.length} chars`);
      
      const parsed = JSON.parse(rawText);
      const validation = validateStudyMaterial(parsed);
      
      if (!validation.ok) {
        console.error("[Gemini Action] Validation failed:", validation.error);
        throw new Error(`Invalid response format: ${validation.error}`);
      }

      console.log("[Gemini Action] Saving study material to database...");
      await ctx.runMutation(api.studyMaterials.save, {
        noteId: args.noteId,
        summary: validation.data.summary,
        keyPoints: validation.data.keyPoints,
        quizQuestions: validation.data.quizQuestions,
      });
      console.log("[Gemini Action] Success!");

      return { ok: true };
    } catch (err) {
      console.error("[Gemini Action] Error during generation:", err);
      if (err instanceof Error) {
        if (err.message.includes("forcibly closed") || err.message.includes("ECONNRESET") || err.message.includes("socket")) {
          throw new Error("Network connection to the AI service was interrupted. This often happens with very large files. Please try a smaller file or try again.");
        }
        throw new Error(err.message);
      }
      throw new Error("Failed to generate study material due to an unexpected error.");
    }
  },
});