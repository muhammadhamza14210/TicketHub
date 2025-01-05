"use server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { stripe } from "@/lib/stripe";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing Convex URL in environment variables.");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const createStripeConnectCustomers = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized user.");
  }

  const exisitingStripeConnectId = await convex.query(
    api.users.getUserStripeConnectId,
    { userId }
  );

  if (exisitingStripeConnectId) {
    return { account: exisitingStripeConnectId };
  }

  const account = await stripe.accounts.create({
    type: "express",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });

  await convex.mutation(api.users.updateUserStripeConnectId, {
    userId,
    stripeConnectId: account.id
  });
  return { account: account.id };
};
