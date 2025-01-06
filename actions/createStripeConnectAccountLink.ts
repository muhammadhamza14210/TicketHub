"use server";

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function createStripeConnectAccountLink(account: string) {
  try {
    const headerList = await headers();
    const origin = headerList.get("origin") || "";

    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${origin}/connect/refresh/${account}`,
      return_url: `${origin}/connect/return/${account}`,
      type: "account_onboarding"
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Error creating Stripe Connect account link:", error);
    throw new Error("Error creating Stripe Connect account link:");
  }
}
