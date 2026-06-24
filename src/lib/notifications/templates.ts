import { prisma } from "@/lib/prisma";
import { defaultNotificationTemplates } from "@/config/notification.defaults";
import type { NotificationChannel, NotificationEvent } from "@/types/notifications";

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    output = output.replace(new RegExp(`{{${key}}}`, "g"), value ?? "");
  }
  return output;
}

export async function ensureDefaultTemplates() {
  for (const tpl of defaultNotificationTemplates) {
    const existing = await prisma.notificationTemplate.findUnique({
      where: {
        event_channel: { event: tpl.event, channel: tpl.channel },
      },
    });
    if (!existing) {
      await prisma.notificationTemplate.create({
        data: {
          event: tpl.event,
          channel: tpl.channel,
          name: tpl.name,
          subject: tpl.subject,
          body: tpl.body,
          variables: tpl.variables,
          isActive: true,
        },
      });
    }
  }
}

export async function getTemplatesForEvent(event: NotificationEvent) {
  try {
    await ensureDefaultTemplates();
    return prisma.notificationTemplate.findMany({
      where: { event, isActive: true },
    });
  } catch {
    return defaultNotificationTemplates
      .filter((t) => t.event === event)
      .map((t) => ({
        id: `${t.event}-${t.channel}`,
        event: t.event,
        channel: t.channel,
        name: t.name,
        subject: t.subject ?? null,
        body: t.body,
        variables: t.variables,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
  }
}

export async function getTemplate(event: NotificationEvent, channel: NotificationChannel) {
  const templates = await getTemplatesForEvent(event);
  return templates.find((t) => t.channel === channel) ?? null;
}

export async function listAllTemplates() {
  try {
    await ensureDefaultTemplates();
    return prisma.notificationTemplate.findMany({
      orderBy: [{ event: "asc" }, { channel: "asc" }],
    });
  } catch {
    return [];
  }
}
