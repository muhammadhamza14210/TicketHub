"use server";

import { auth } from "@clerk/nextjs/server";
import { Id } from "../convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { DURATIONS } from "../convex/constants";
import { baseUrl } from "@/lib/baseUrl";

export type StripeCheckoutMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingList: Id<"waitingList">;
};

export async function createStripeCheckoutSessions({
  eventId
}: { eventId: Id<"events"> }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized user.");
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("Missing Convex URL in environment variables.");
  }
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  const events = await convex.query(api.events.getEventById, { eventId });
  if (!events) {
    throw new Error("Event not found.");
  }
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    userId,
    eventId
  });
  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error(
      "User is not in the waiting list or is not an offered ticket."
    );
  }
  const stripeConnectId = await convex.query(api.users.getUserStripeConnectId, {
    userId: events.userId
  });
  if (!stripeConnectId) {
    throw new Error("User does not have a Stripe Connect account.");
  }
  if (queuePosition.offerExpiresAt) {
    throw new Error("Offer has expired.");
  }

  const metadata: StripeCheckoutMetaData = {
    eventId,
    userId,
    waitingList: queuePosition._id
  };

  // Create a Stripe Checkout session
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: events.name,
              description: events.description
            },
            unit_amount: Math.round(events.price * 100) //Amount in cents
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(events.price * 100 * 0.01) //1% fee
      },
      expires_at: Math.floor(Date.now() / 1000) + DURATIONS.TICKET_OFFER / 1000,
      //30 minutes stripe checkout minimum expiration
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata
    },
    {
      stripeAccount: stripeConnectId
    }
  );

  return { sessionId: session.id, sessionUrl: session.url};
}
