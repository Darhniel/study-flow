import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { noteStatus } from "./schema";
import { getAuthenticatedUser } from "./authHelpers";

export const list = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    status: v.optional(noteStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);

    if (args.subjectId) {
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_user_subject", (q) =>
          q.eq("userId", userId).eq("subjectId", args.subjectId!)
        )
        .order("desc")
        .collect();
      if (args.status) {
        return notes.filter((n) => n.status === args.status);
      }
      return notes;
    }
    if (args.status) {
      return await ctx.db
        .query("notes")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const listRecentlyUpdated = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit);
  },
});

export const listWithStudyMaterial = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const materials = await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit);

    const notesWithMaterial = await Promise.all(
      materials.map(async (material) => {
        const note = await ctx.db.get(material.noteId);
        if (!note || note.userId !== userId) return null;
        return {
          ...note,
          materialCreatedAt: material.createdAt,
        };
      })
    );

    return notesWithMaterial.filter((n): n is NonNullable<typeof n> => n !== null);
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) return null;
    return note;
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUser(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return notes.length;
  },
});

export const countByStatus = query({
  args: { status: noteStatus },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", args.status)
      )
      .collect();
    return notes.length;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subjectId: v.optional(v.id("subjects")),
    status: v.optional(noteStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId,
      title: args.title,
      content: args.content,
      subjectId: args.subjectId,
      status: args.status ?? "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    status: v.optional(noteStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Note not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const toggleStatus = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
    const newStatus = note.status === "active" ? "completed" : "active";
    await ctx.db.patch(args.id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
    await ctx.db.delete(args.id);
  },
});