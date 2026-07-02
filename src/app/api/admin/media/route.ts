import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/purchase/documents";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

const ALLOWED_ADMIN_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

const MAX_ADMIN_MEDIA_MB = 15;

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.MEDIA_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = search
    ? { originalName: { contains: search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.media.count({ where }),
  ]);

  return apiSuccess({
    items: items.map((m) => ({
      id: m.id,
      name: m.originalName,
      type: m.type,
      mimeType: m.mimeType,
      size: m.size,
      url: m.url,
      createdAt: m.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.MEDIA_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  if (!isCloudinaryConfigured()) {
    return apiError("Cloudinary is not configured. Set CLOUDINARY_* environment variables.", 503);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const alt = String(formData.get("alt") ?? "").trim() || undefined;

    if (!file) return apiError("No file provided", 400);

    if (
      !ALLOWED_ADMIN_MEDIA_TYPES.includes(
        file.type as (typeof ALLOWED_ADMIN_MEDIA_TYPES)[number]
      )
    ) {
      return apiError("File type not allowed. Use JPG, PNG, WebP, GIF, or PDF.", 400);
    }

    if (file.size > MAX_ADMIN_MEDIA_MB * 1024 * 1024) {
      return apiError(`File must be under ${MAX_ADMIN_MEDIA_MB}MB`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, "cms/media");

    const mediaType = file.type === "application/pdf" ? "DOCUMENT" : "IMAGE";

    const media = await prisma.media.create({
      data: {
        filename: upload.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: mediaType,
        url: upload.secure_url,
        publicId: upload.public_id,
        width: upload.width ?? undefined,
        height: upload.height ?? undefined,
        alt,
        uploadedBy: auth.session?.user?.id,
      },
    });

    return apiSuccess(
      {
        id: media.id,
        name: media.originalName,
        type: media.type,
        mimeType: media.mimeType,
        size: media.size,
        url: media.url,
        createdAt: media.createdAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("[admin/media] upload failed:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return apiError(message, 400);
  }
}
