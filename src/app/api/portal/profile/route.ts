import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortalProfile } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { updateProfileSchema } from "@/validations/profile";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const profile = await getPortalProfile(session.user.id);
  if (!profile) return apiError("Profile not found", 404);

  return apiSuccess(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const body = updateProfileSchema.parse(await req.json());

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
        ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.dateOfBirth
          ? { dateOfBirth: new Date(body.dateOfBirth) }
          : {}),
        ...(body.address ? { address: body.address } : {}),
      },
    });

    const profile = await getPortalProfile(session.user.id);
    return apiSuccess(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, 400);
  }
}
