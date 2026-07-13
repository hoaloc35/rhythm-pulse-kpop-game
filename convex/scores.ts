import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const submitScore = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });
    await ctx.db.insert("scores", { userId: user._id, ...args });
    await ctx.db.patch(user._id, {
      totalScore: (user.totalScore ?? 0) + args.score,
      gamesPlayed: (user.gamesPlayed ?? 0) + 1,
    });
  },
});

export const getLeaderboard = query({
  args: { songId: v.string(), difficulty: v.string() },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_song_score", (q) => q.eq("songId", args.songId))
      .order("desc")
      .take(10);
    const filtered = scores.filter((s) => s.difficulty === args.difficulty);
    return await Promise.all(
      filtered.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return { ...s, userName: user?.name ?? "Player" };
      })
    );
  },
});

export const getMyBest = query({
  args: { songId: v.string(), difficulty: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const filtered = scores
      .filter((s) => s.songId === args.songId && s.difficulty === args.difficulty)
      .sort((a, b) => b.score - a.score);
    return filtered[0] ?? null;
  },
});
