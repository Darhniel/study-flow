import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./authHelpers";

export const getByNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return null;

    return await ctx.db
      .query("studyMaterials")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .order("desc")
      .first();
  },
});

export const save = mutation({
  args: {
    noteId: v.id("notes"),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    quizQuestions: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    const existing = await ctx.db
      .query("studyMaterials")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: args.summary,
        keyPoints: args.keyPoints,
        quizQuestions: args.quizQuestions,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("studyMaterials", {
      userId,
      noteId: args.noteId,
      summary: args.summary,
      keyPoints: args.keyPoints,
      quizQuestions: args.quizQuestions,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return;

    const existing = await ctx.db
      .query("studyMaterials")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});