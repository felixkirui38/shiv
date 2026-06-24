export interface AiAdvisorSettings {
  enabled: boolean;
  showOnPublicSite: boolean;
  allowGuests: boolean;
  model: string;
  welcomeMessage: string;
  assistantName: string;
  systemPromptExtra: string;
  maxTokens: number;
}

export interface AiAdvisorPublicConfig {
  enabled: boolean;
  showOnPublicSite: boolean;
  welcomeMessage: string;
  assistantName: string;
}

export interface AiChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface AiToolResult {
  tool: string;
  data: unknown;
}
