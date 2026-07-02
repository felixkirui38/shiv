import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.MEDIA_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return apiError("Media not found", 404);

  try {
    if (media.publicId) {
      await deleteFromCloudinary(media.publicId).catch(() => undefined);
    }
    await prisma.media.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError(
      "Cannot delete this file because it is linked to other content. Remove references first.",
      409
    );
  }
}
