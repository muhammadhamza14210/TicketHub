import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getImageUrl = query({
    args: { storageId: v.id("_storage")},
    handler: async (ctx, { storageId }) => {
       return await ctx.storage.getUrl(storageId)
    }
})