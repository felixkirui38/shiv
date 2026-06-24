import type { AiAdvisorSettings } from "@/types/ai-advisor";

export const defaultAiAdvisorSettings: AiAdvisorSettings = {
  enabled: false,
  showOnPublicSite: true,
  allowGuests: true,
  model: "gpt-4o-mini",
  welcomeMessage:
    "Hello! I'm your Shiv Insurance advisor. I can suggest products, estimate premiums, explain claims, and compare policies. How can I help you today?",
  assistantName: "Shiv Insurance Advisor",
  systemPromptExtra: "",
  maxTokens: 1200,
};
