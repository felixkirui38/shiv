import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { getApplicationForAccess } from "@/lib/purchase/access";
import {
  getApplicationUploadConfig,
  validateApplicationFile,
  APPLICATION_UPLOAD_FOLDER,
  type ApplicationUploadedFile,
} from "@/lib/purchase/documents";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await getApplicationForAccess(id, _req);
  if (!app) return apiError("Application not found", 404);

  return apiSuccess(getApplicationUploadConfig());
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const app = await getApplicationForAccess(id, req);
    if (!app) return apiError("Application not found or not editable", 404);

    const uploadConfig = getApplicationUploadConfig();
    if (!uploadConfig.enabled) {
      return apiError(
        "Document upload is temporarily unavailable. Please try again later.",
        503
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fieldKey = String(formData.get("fieldKey") ?? "").trim();

    if (!file) return apiError("No file provided", 400);
    if (!fieldKey) return apiError("fieldKey is required", 400);

    const validationError = validateApplicationFile(file);
    if (validationError) return apiError(validationError, 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, `${APPLICATION_UPLOAD_FOLDER}/${id}`);

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
      },
    });

    const uploaded: ApplicationUploadedFile = {
      mediaId: media.id,
      url: media.url,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      fieldKey,
      uploadedAt: new Date().toISOString(),
    };

    const existingDocuments =
      (app.documents as Record<string, ApplicationUploadedFile> | null) ?? {};
    const existingFormData = (app.formData as Record<string, unknown>) ?? {};
    const previous = existingDocuments[fieldKey];

    if (previous?.mediaId) {
      const oldMedia = await prisma.media.findUnique({
        where: { id: previous.mediaId },
        select: { id: true, publicId: true },
      });
      if (oldMedia?.publicId) {
        await deleteFromCloudinary(oldMedia.publicId).catch(() => undefined);
      }
      if (oldMedia) {
        await prisma.media.delete({ where: { id: oldMedia.id } }).catch(() => undefined);
      }
    }

    const documents = { ...existingDocuments, [fieldKey]: uploaded };
    const formDataUpdate = { ...existingFormData, [fieldKey]: uploaded };

    await prisma.insuranceApplication.update({
      where: { id },
      data: {
        documents: documents as object,
        formData: formDataUpdate as object,
      },
    });

    return apiSuccess({ file: uploaded });
  } catch (error) {
    console.error("[purchase/documents]", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return apiError(message, 400);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await getApplicationForAccess(id, req);
  if (!app) return apiError("Application not found or not editable", 404);

  const { searchParams } = new URL(req.url);
  const fieldKey = searchParams.get("fieldKey");
  if (!fieldKey) return apiError("fieldKey is required", 400);

  const existingDocuments =
    (app.documents as Record<string, ApplicationUploadedFile> | null) ?? {};
  const existingFormData = (app.formData as Record<string, unknown>) ?? {};
  const removed = existingDocuments[fieldKey];

  if (removed?.mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: removed.mediaId },
      select: { id: true, publicId: true },
    });
    if (media?.publicId) {
      await deleteFromCloudinary(media.publicId).catch(() => undefined);
    }
    if (media) {
      await prisma.media.delete({ where: { id: media.id } }).catch(() => undefined);
    }
  }

  const { [fieldKey]: _removed, ...documents } = existingDocuments;
  const { [fieldKey]: _removedField, ...formData } = existingFormData;

  await prisma.insuranceApplication.update({
    where: { id },
    data: {
      documents: documents as object,
      formData: formData as object,
    },
  });

  return apiSuccess({ deleted: true });
}
