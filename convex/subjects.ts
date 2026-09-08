import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUserOrThrow } from "./authHelpers";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        return await ctx.db
            .query("subjects")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("asc")
            .collect();
    },
});

export const get = query({
    args: { id: v.id("subjects") },
    handler: async (ctx, args) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const subject = await ctx.db.get(args.id);
        if (!subject || subject.userId !== userId) return null;
        return subject;
    },
});

export const listWithStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const subjects = await ctx.db
            .query("subjects")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("asc")
            .collect();

        const subjectsWithStats = await Promise.all(
            subjects.map(async (subject) => {
                const notes = await ctx.db
                    .query("notes")
                    .withIndex("by_user_subject", (q) =>
                        q.eq("userId", userId).eq("subjectId", subject._id)
                    )
                    .collect();

                const completedCount = notes.filter((n) => n.status === "completed").length;
                const lastUpdated = notes.length > 0
                    ? Math.max(...notes.map((n) => n.updatedAt))
                    : null;

                return {
                    ...subject,
                    noteCount: notes.length,
                    completedCount,
                    lastUpdated,
                };
            })
        );

        return subjectsWithStats;
    },
});

export const count = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const subjects = await ctx.db
            .query("subjects")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        return subjects.length;
    },
});

export const create = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const trimmed = args.name.trim();
        if (!trimmed) throw new Error("Subject name is required");

        const existing = await ctx.db
            .query("subjects")
            .withIndex("by_user_name", (q) =>
                q.eq("userId", userId).eq("name", trimmed)
            )
            .first();

        if (existing) {
            throw new Error("A subject with this name already exists");
        }

        return await ctx.db.insert("subjects", {
            userId,
            name: trimmed,
            createdAt: Date.now(),
        });
    },
});

export const rename = mutation({
    args: { id: v.id("subjects"), name: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const trimmed = args.name.trim();
        if (!trimmed) throw new Error("Subject name is required");

        const subject = await ctx.db.get(args.id);
        if (!subject || subject.userId !== userId) {
            throw new Error("Subject not found");
        }

        const existing = await ctx.db
            .query("subjects")
            .withIndex("by_user_name", (q) =>
                q.eq("userId", userId).eq("name", trimmed)
            )
            .first();

        if (existing && existing._id !== args.id) {
            throw new Error("A subject with this name already exists");
        }

        await ctx.db.patch(args.id, { name: trimmed });
    },
});

export const remove = mutation({
    args: { id: v.id("subjects") },
    handler: async (ctx, args) => {
        const userId = await getAuthenticatedUserOrThrow(ctx);
        const subject = await ctx.db.get(args.id);
        if (!subject || subject.userId !== userId) {
            throw new Error("Subject not found");
        }

        const notesWithSubject = await ctx.db
            .query("notes")
            .withIndex("by_user_subject", (q) =>
                q.eq("userId", userId).eq("subjectId", args.id)
            )
            .first();

        if (notesWithSubject) {
            throw new Error(
                "Cannot delete this subject because it is still assigned to one or more notes. Reassign or delete those notes first."
            );
        }
        await ctx.db.delete(args.id);
    },
});