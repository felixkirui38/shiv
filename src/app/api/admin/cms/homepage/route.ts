import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getHomepageContent,
  saveHomepageContent,
} from "@/lib/cms/homepage";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { HomepageContent } from "@/types/homepage";
import type { UserRole } from "@/generated/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "cms:manage")) {
    return apiError("Forbidden", 403);
  }

  const content = await getHomepageContent();
  return apiSuccess(content);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "cms:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const body = (await req.json()) as HomepageContent;
    await saveHomepageContent(body);
    return apiSuccess({ saved: true });
  } catch {
    return apiError("Failed to save homepage content", 500);
  }
}
