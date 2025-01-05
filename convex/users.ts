import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserById = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    return user;
  }
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string()
  },
  handler: async (ctx, { userId, name, email }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name,
        email
      });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      userId,
      name,
      email,
      stripeConnectId: undefined
    });
    return newUserId;
  }
});

export const getUserStripeConnectId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.neq(q.field("stripeConnectId"), undefined))
      .first();
    return user?.stripeConnectId;
  }
});

export const updateUserStripeConnectId = mutation({
  args: { userId: v.string(), stripeConnectId: v.string() },
  handler: async (ctx, { userId, stripeConnectId }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        stripeConnectId
      });
      return existingUser._id;
    }

    throw new Error("User not found");
  }
});
