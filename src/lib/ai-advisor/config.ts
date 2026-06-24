import { prisma } from "@/lib/prisma";
import { defaultAiAdvisorSettings } from "@/config/ai-advisor.defaults";
import type { AiAdvisorPublicConfig, AiAdvisorSettings } from "@/types/ai-advisor";

const SETTINGS_KEY = "ai_advisor_settings";

export async function getAiAdvisorSettings(): Promise<AiAdvisorSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });
    if (setting?.value) {
      return { ...defaultAiAdvisorSettings, ...(setting.value as Partial<AiAdvisorSettings>) };
    }
  } catch {
    // DB unavailable
  }
  return defaultAiAdvisorSettings;
}

export async function saveAiAdvisorSettings(settings: AiAdvisorSettings): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: settings as object, group: "ai-advisor" },
    create: { key: SETTINGS_KEY, value: settings as object, group: "ai-advisor" },
  });
}

export async function getAiAdvisorPublicConfig(): Promise<AiAdvisorPublicConfig> {
  const settings = await getAiAdvisorSettings();
  return {
    enabled: settings.enabled && !!process.env.OPENAI_API_KEY,
    showOnPublicSite: settings.showOnPublicSite,
    welcomeMessage: settings.welcomeMessage,
    assistantName: settings.assistantName,
  };
}

export function isAiAdvisorAvailable(settings: AiAdvisorSettings): boolean {
  return settings.enabled && !!process.env.OPENAI_API_KEY;
}
