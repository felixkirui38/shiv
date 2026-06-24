import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getSiteNavigation,
  saveSiteNavigation,
} from "@/lib/cms/navigation";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { SiteNavigationConfig } from "@/types/navigation";
import type { UserRole } from "@/generated/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "cms:manage")) {
    return apiError("Forbidden", 403);
  }

  const navigation = await getSiteNavigation();
  return apiSuccess(navigation);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "cms:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const body = (await req.json()) as SiteNavigationConfig;
    await saveSiteNavigation(body);
    return apiSuccess({ saved: true });
  } catch {
    return apiError("Failed to save navigation", 500);
  }
}
