import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    totalScore: v.optional(v.number()),
    gamesPlayed: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]),

  scores: defineTable({
    userId: v.id("users"),
    songId: v.string(),
    score: v.number(),
    grade: v.string(),
    perfect: v.number(),
    great: v.number(),
    good: v.number(),
    bad: v.number(),
    miss: v.number(),
    maxCombo: v.number(),
    difficulty: v.string(),
    calories: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_song", ["songId"])
    .index("by_song_score", ["songId", "score"]),
});
