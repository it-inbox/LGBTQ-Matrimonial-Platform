import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters").trim(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const markReadSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
});
export type MarkReadInput = z.infer<typeof markReadSchema>;

export const conversationFilterSchema = z.object({
  filter: z.enum(["all", "unread", "online"]).default("all"),
});
export type ConversationFilterInput = z.infer<typeof conversationFilterSchema>;
