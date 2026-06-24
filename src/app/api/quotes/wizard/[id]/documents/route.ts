import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getQuoteWizardById } from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_MB,
} from "@/types/quote-wizard";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await getQuoteWizardById(id);
    if (!quote) return apiError("Quote not found", 404);
    if (quote.status !== "DRAFT") return apiError("Quote is not editable", 400);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file provided", 400);

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
      return apiError("Only PDF, PNG, and JPG files are allowed", 400);
    }

    if (file.size > MAX_DOCUMENT_SIZE_MB * 1024 * 1024) {
      return apiError(`File must be under ${MAX_DOCUMENT_SIZE_MB}MB`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const upload = await uploadToCloudinary(base64, `quotes/${id}`);

    const media = await prisma.media.create({
      data: {
        filename: upload.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: file.type === "application/pdf" ? "DOCUMENT" : "IMAGE",
        url: upload.secure_url,
        publicId: upload.public_id,
      },
    });

    const doc = await prisma.quoteDocument.create({
      data: {
        quoteId: id,
        mediaId: media.id,
        fileName: file.name,
        mimeType: file.type,
      },
      include: { media: true },
    });

    const items = [
      ...(quote.wizardData.documents?.items ?? []),
      {
        id: doc.id,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        url: doc.media.url,
        mediaId: doc.mediaId,
      },
    ];

    await prisma.quote.update({
      where: { id },
      data: {
        wizardData: {
          ...quote.wizardData,
          documents: { items },
        } as object,
      },
    });

    return apiSuccess({
      document: {
        id: doc.id,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        url: doc.media.url,
        mediaId: doc.mediaId,
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
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) return apiError("documentId required", 400);

  const quote = await getQuoteWizardById(id);
  if (!quote) return apiError("Quote not found", 404);

  await prisma.quoteDocument.delete({ where: { id: documentId } });

  const items = (quote.wizardData.documents?.items ?? []).filter(
    (d) => d.id !== documentId
  );

  await prisma.quote.update({
    where: { id },
    data: {
      wizardData: { ...quote.wizardData, documents: { items } } as object,
    },
  });

  return apiSuccess({ deleted: true });
}
