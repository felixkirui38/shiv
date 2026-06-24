import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma/client";

export async function requireAdmin(permission?: Permission) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const, session: null };
  }

  const role = session.user.role as UserRole;
  if (role === "CUSTOMER") {
    return { error: "Forbidden", status: 403 as const, session: null };
  }

  if (permission && !hasPermission(role, permission)) {
    return { error: "Forbidden", status: 403 as const, session: null };
  }

  return { error: null, status: 200 as const, session, role };
}
