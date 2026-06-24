import type { BlogPostStatus } from "@/generated/prisma/client";

export function resolvePublishFields(
  status: BlogPostStatus,
  scheduledAt?: string | null,
  existingPublishedAt?: Date | null
) {
  const now = new Date();

  if (status === "PUBLISHED") {
    return {
      isPublished: true,
      publishedAt: existingPublishedAt ?? now,
      scheduledAt: null as Date | null,
    };
  }

  if (status === "SCHEDULED" && scheduledAt) {
    const at = new Date(scheduledAt);
    return {
      isPublished: false,
      publishedAt: null as Date | null,
      scheduledAt: at,
    };
  }

  return {
    isPublished: false,
    publishedAt: null as Date | null,
    scheduledAt: status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt) : null,
  };
}
