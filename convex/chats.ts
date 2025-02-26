import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

/**
 * Crea un nuevo chat para el usuario autenticado.
 *
 * @param ctx - El contexto de la mutación que contiene la autenticación y acceso a la base de datos
 * @param args - Los argumentos de la mutación
 * @param args.title - El título del nuevo chat
 * @returns El documento del chat creado
 * @throws {Error} Si el usuario no está autenticado
 */
export type CreateChatArgs = {
  title: string;
};

export type Chat = {
  _id: Id<"chats">;
  _creationTime: number;
  title: string;
  userId: string;
  createdAt: number;
};

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx: MutationCtx, args: CreateChatArgs): Promise<Id<"chats">> => {
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
  handler: async (ctx: MutationCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Check if the user is authenticated
    if (!identity) {
      throw new Error("Called deleteChat without authentication present");
    }

    // Check if the chat exists and if the user is the owner
    const chat = await ctx.db.get(args.id);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Called deleteChat with invalid id");
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat document
    await ctx.db.delete(args.id);
  },
});

export const listChats = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called listChats without authentication present");
    }

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    return chats;
  },
});
