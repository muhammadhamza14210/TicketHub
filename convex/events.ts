import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";

export const getEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isCancelled"), undefined))
      .collect();
  }
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  }
});

export const getEventAvaliablility = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then((tickets) => {
        return tickets.filter(
          (ticket) =>
            ticket.status === TICKET_STATUS.VALID ||
            ticket.status === TICKET_STATUS.USED
        ).length;
      });

    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;
    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingOffers: Math.max(0, event.totalTickets - totalReserved)
    };
  }
});
