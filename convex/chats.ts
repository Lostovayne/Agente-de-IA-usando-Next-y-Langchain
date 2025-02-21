import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeChat without authentication present");
    }

    const chat = await ctx.db.insert("chats", {
      title: args.title,
      userId: identity.subject,
      createdAt: Date.now(),
    });
    return chat;
  },
});

export const deleteChat = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called deleteChat without authentication present");
    }

    const chat = await ctx.db.get(args.id);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Called deleteChat with invalid id");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    //Delete the chat

    await ctx.db.delete(args.id);
  },
});
