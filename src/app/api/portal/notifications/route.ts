import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listPortalNotifications } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const notifications = await listPortalNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.isRead).length;
  return apiSuccess({ items: notifications, unread });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return apiSuccess({ markedAll: true });
}
