import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

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

export const checkAvailability = query({
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

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);
    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers
    };
  }
});
export const joinWaitingList = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string()
  },
  handler: async (ctx, { eventId, userId }) => {
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    if (existingEntry) {
      throw new Error("Already on the waiting list");
    }

    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const { available } = await checkAvailability(ctx, { eventId });
    const now = Date.now();
    if (available) {
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt: now + DURATIONS.TICKET_OFFER
      });

      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        { waitingListId, eventId }
      );
    } else {
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING
      });
    }
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED
        : WAITING_LIST_STATUS.WAITING,
      message: available
        ? `Ticket available, you have ${DURATIONS.TICKET_OFFER / (60 * 1000)} minutes to accept`
        : "Ticket not available, you will be notified when it becomes available"
    };
  }
});
