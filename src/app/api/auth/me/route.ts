import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      emailVerified: true,
      dateOfBirth: true,
      address: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) return apiError("User not found", 404);

  return apiSuccess({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    address: (user.address as Record<string, string> | null) ?? {},
    memberSince: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  });
}
