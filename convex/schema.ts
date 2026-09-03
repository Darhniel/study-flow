import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const noteStatus = v.union(v.literal("active"), v.literal("completed"));

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  subjects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    subjectId: v.optional(v.id("subjects")),
    status: noteStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_subject", ["userId", "subjectId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_user_created", ["userId", "createdAt"]),

  studyMaterials: defineTable({
    userId: v.id("users"),
    noteId: v.id("notes"),
    summary: v.string(),
    keyPoints: v.array(v.string()),
    quizQuestions: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_note", ["noteId"]),
});