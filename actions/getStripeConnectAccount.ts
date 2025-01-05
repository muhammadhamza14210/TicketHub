"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing Convex URL in environment variables.");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function getStripeConnectId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized user.");
  }

  const stripeConnectId = await convex.query(api.users.getUserStripeConnectId,{
    userId
  });

  return { stripeConnectId: stripeConnectId || null}

}
