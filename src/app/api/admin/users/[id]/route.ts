import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { updateStaffUserSchema } from "@/validations/admin-user";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.USERS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, role: { not: "CUSTOMER" } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) return apiError("User not found", 404);
  return apiSuccess({
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.USERS_EDIT);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;

  try {
    const body = updateStaffUserSchema.parse(await req.json());
    const existing = await prisma.user.findFirst({
      where: { id, role: { not: "CUSTOMER" } },
    });
    if (!existing) return apiError("User not found", 404);

    if (auth.session?.user?.id === id && body.status === "SUSPENDED") {
      return apiError("You cannot suspend your own account", 400);
    }

    const passwordHash = body.password
      ? await bcrypt.hash(body.password, 12)
      : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: body.role,
        status: body.status,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.USERS_DELETE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  if (auth.session?.user?.id === id) {
    return apiError("You cannot delete your own account", 400);
  }

  const existing = await prisma.user.findFirst({
    where: { id, role: { not: "CUSTOMER" } },
  });
  if (!existing) return apiError("User not found", 404);

  if (existing.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    });
    if (superAdminCount <= 1) {
      return apiError("Cannot delete the last active super admin", 400);
    }
  }

  await prisma.user.delete({ where: { id } });
  return apiSuccess({ deleted: true });
}
