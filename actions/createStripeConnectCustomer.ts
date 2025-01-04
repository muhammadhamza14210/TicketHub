"use server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL){
    throw new Error("Missing Convex URL in environment variables.");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const createStripeConnectCustomers = async () => {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("Unauthorized user.");
    }
}