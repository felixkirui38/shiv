import { z } from "zod";

export const aiAdvisorSettingsSchema = z.object({
  enabled: z.boolean(),
  showOnPublicSite: z.boolean(),
  allowGuests: z.boolean(),
  model: z.string().min(1).max(64),
  welcomeMessage: z.string().min(1).max(2000),
  assistantName: z.string().min(1).max(80),
  systemPromptExtra: z.string().max(4000),
  maxTokens: z.number().int().min(256).max(4096),
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  sessionId: z.string().min(8).max(128),
});
