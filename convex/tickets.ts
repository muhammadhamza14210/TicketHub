import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const userTicket = query({
  args: {
    eventId: v.id("events"),
    userId: v.string()
  },
  handler: async (ctx, { eventId, userId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .first();
    return ticket;
  }
});