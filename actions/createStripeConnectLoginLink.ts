"use server";

import { stripe } from "@/lib/stripe";

export async function createStripeConnectLoginLink(stripeConnectId: string) {
  if (!stripeConnectId) {
    throw new Error("Missing stripeConnectId");
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeConnectId);
    return loginLink.url;
  } catch (error) {
    console.error("Error creating Stripe Connect login link:", error);
    throw new Error("Error creating Stripe Connect login link:");
  }
}
