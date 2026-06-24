import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
  ALLOWED_CLAIM_MIME_TYPES,
  MAX_CLAIM_FILE_MB,
} from "@/lib/claims/types";
import type { ClaimDocumentCategory } from "@/generated/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const claim = await prisma.claim.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!claim) return apiError("Claim not found", 404);
    if (!["DRAFT", "DOCUMENTS_REQUESTED"].includes(claim.status)) {
      return apiError("Cannot upload documents for this claim status", 400);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as ClaimDocumentCategory) ?? "OTHER";

    if (!file) return apiError("No file provided", 400);

    if (
      !ALLOWED_CLAIM_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_CLAIM_MIME_TYPES)[number]
      )
    ) {
      return apiError("File type not allowed", 400);
    }

    if (file.size > MAX_CLAIM_FILE_MB * 1024 * 1024) {
      return apiError(`File must be under ${MAX_CLAIM_FILE_MB}MB`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, `claims/${id}`);

    const mediaType = file.type.startsWith("video/")
      ? "VIDEO"
      : file.type === "application/pdf"
        ? "DOCUMENT"
        : "IMAGE";

    const media = await prisma.media.create({
      data: {
        filename: upload.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: mediaType,
        url: upload.secure_url,
        publicId: upload.public_id,
      },
    });

    const doc = await prisma.claimDocument.create({
      data: {
        claimId: id,
        mediaId: media.id,
        name: file.name,
        type: file.type,
        category,
      },
      include: { media: true },
    });

    return apiSuccess({
      document: {
        id: doc.id,
        name: doc.name,
        category: doc.category,
        url: doc.media.url,
        mimeType: doc.media.mimeType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return apiError(message, 400);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) return apiError("documentId required", 400);

  const claim = await prisma.claim.findFirst({
    where: { id, userId: session.user.id, status: "DRAFT" },
  });
  if (!claim) return apiError("Claim not found or not editable", 404);

  await prisma.claimDocument.delete({ where: { id: documentId, claimId: id } });
  return apiSuccess({ deleted: true });
}
