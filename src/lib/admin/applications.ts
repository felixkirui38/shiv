import { prisma } from "@/lib/prisma";
import type { ApplicationUploadedFile } from "@/lib/purchase/documents";

export async function getAdminApplicationById(id: string) {
  const app = await prisma.insuranceApplication.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, slug: true, name: true, category: true } },
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      },
      form: { select: { id: true, slug: true, name: true } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          paidAt: true,
        },
      },
      policy: { select: { id: true, policyNumber: true, status: true } },
    },
  });

  if (!app) return null;

  const formData = (app.formData as Record<string, unknown>) ?? {};
  const documents = (app.documents as Record<string, ApplicationUploadedFile> | null) ?? {};
  const premiumBreakdown = app.premiumBreakdown as Record<string, unknown> | null;

  const documentList = Object.values(documents).map((doc) => ({
    fieldKey: doc.fieldKey,
    fileName: doc.fileName,
    url: doc.url,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedAt: doc.uploadedAt,
  }));

  return {
    id: app.id,
    applicationNumber: app.applicationNumber,
    status: app.status,
    currentStep: app.currentStep,
    formData,
    documents: documentList,
    premiumBreakdown,
    basicPremium: app.basicPremium ? Number(app.basicPremium) : null,
    levies: app.levies ? Number(app.levies) : null,
    taxes: app.taxes ? Number(app.taxes) : null,
    stampDuty: app.stampDuty ? Number(app.stampDuty) : null,
    totalPremium: Number(app.totalPremium),
    reviewNotes: app.reviewNotes,
    rejectionReason: app.rejectionReason,
    submittedAt: app.submittedAt?.toISOString() ?? null,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    product: app.product,
    customer: app.user
      ? {
          id: app.user.id,
          name: `${app.user.firstName ?? ""} ${app.user.lastName ?? ""}`.trim() || app.user.email,
          email: app.user.email,
          phone: app.user.phone,
        }
      : {
          id: null,
          name: String(formData.fullName ?? formData.email ?? "Guest"),
          email: String(formData.email ?? "—"),
          phone: (formData.phone as string | undefined) ?? null,
        },
    form: app.form,
    order: app.order
      ? {
          ...app.order,
          totalAmount: Number(app.order.totalAmount),
          paidAt: app.order.paidAt?.toISOString() ?? null,
        }
      : null,
    policy: app.policy,
  };
}

export async function updateAdminApplication(
  id: string,
  action: "approve" | "reject" | "request_documents",
  options?: { reason?: string; notes?: string }
) {
  const data =
    action === "approve"
      ? { status: "APPROVED" as const, reviewNotes: options?.notes }
      : action === "reject"
        ? {
            status: "REJECTED" as const,
            rejectionReason: options?.reason ?? "Application rejected",
            reviewNotes: options?.notes,
          }
        : {
            status: "PENDING_REVIEW" as const,
            reviewNotes: options?.notes ?? "Additional documents requested",
          };

  return prisma.insuranceApplication.update({
    where: { id },
    data,
  });
}
