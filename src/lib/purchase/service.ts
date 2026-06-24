import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import type { PremiumBreakdown, PurchaseApplicationState } from "@/types/purchase";
import {
  generateApplicationNumber,
  generateOrderNumber,
} from "@/lib/purchase/number";

export async function serializeApplication(app: {
  id: string;
  applicationNumber: string;
  resumeToken: string | null;
  currentStep: number;
  status: string;
  formData: unknown;
  premiumBreakdown: unknown;
  totalPremium: unknown;
  product: { id: string; slug: string; name: string; category: string | null };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: unknown;
  } | null;
}): Promise<PurchaseApplicationState> {
  return {
    id: app.id,
    applicationNumber: app.applicationNumber,
    resumeToken: app.resumeToken ?? "",
    currentStep: app.currentStep,
    status: app.status as PurchaseApplicationState["status"],
    formData: (app.formData as Record<string, unknown>) ?? {},
    premiumBreakdown: (app.premiumBreakdown as PremiumBreakdown | null) ?? null,
    totalPremium: Number(app.totalPremium),
    product: app.product,
    order: app.order
      ? {
          id: app.order.id,
          orderNumber: app.order.orderNumber,
          status: app.order.status as PurchaseApplicationState["order"] extends infer O | null | undefined
            ? O extends { status: infer S }
              ? S
              : never
            : never,
          totalAmount: Number(app.order.totalAmount),
        }
      : null,
  };
}

const applicationInclude = {
  product: { select: { id: true, slug: true, name: true, category: true } },
  order: {
    select: { id: true, orderNumber: true, status: true, totalAmount: true },
  },
} as const;

export async function getApplicationById(id: string) {
  try {
    const app = await prisma.insuranceApplication.findUnique({
      where: { id },
      include: applicationInclude,
    });
    if (!app) return null;
    return serializeApplication(app);
  } catch {
    return null;
  }
}

export async function getApplicationByToken(token: string) {
  try {
    const app = await prisma.insuranceApplication.findUnique({
      where: { resumeToken: token },
      include: applicationInclude,
    });
    if (!app || !["DRAFT", "SUBMITTED", "PENDING_PAYMENT"].includes(app.status)) {
      return null;
    }
    return serializeApplication(app);
  } catch {
    return null;
  }
}

export async function createApplicationDraft(params: {
  productId: string;
  formId?: string;
  sessionId?: string;
  userId?: string;
}) {
  const product = await prisma.insuranceProduct.findUnique({
    where: { id: params.productId },
    include: {
      formDefinitions: {
        where: { isActive: true },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });
  if (!product) throw new Error("Product not found");

  const formId = params.formId ?? product.formDefinitions[0]?.id;
  const applicationNumber = await generateApplicationNumber();
  const resumeToken = randomUUID();

  const app = await prisma.insuranceApplication.create({
    data: {
      applicationNumber,
      productId: product.id,
      formId,
      userId: params.userId,
      sessionId: params.sessionId,
      resumeToken,
      currentStep: 1,
      status: "DRAFT",
      formData: {},
      totalPremium: product.basePremium,
    },
    include: applicationInclude,
  });

  return serializeApplication(app);
}

export async function updateApplicationDraft(
  id: string,
  data: {
    currentStep?: number;
    formData?: Record<string, unknown>;
    premiumBreakdown?: PremiumBreakdown | null;
    totalPremium?: number;
    status?: PurchaseApplicationState["status"];
    documents?: unknown;
  }
) {
  const app = await prisma.insuranceApplication.update({
    where: { id },
    data: {
      currentStep: data.currentStep,
      formData: data.formData as object | undefined,
      premiumBreakdown: data.premiumBreakdown as object | undefined,
      basicPremium: data.premiumBreakdown?.basicPremium,
      levies: data.premiumBreakdown?.levies,
      taxes: data.premiumBreakdown?.taxes,
      stampDuty: data.premiumBreakdown?.stampDuty,
      totalPremium: data.totalPremium,
      status: data.status,
      documents: data.documents as object | undefined,
      submittedAt: data.status === "SUBMITTED" ? new Date() : undefined,
      updatedAt: new Date(),
    },
    include: applicationInclude,
  });

  return serializeApplication(app);
}

export async function createOrderFromApplication(applicationId: string) {
  const app = await prisma.insuranceApplication.findUnique({
    where: { id: applicationId },
    include: { product: true, order: true },
  });
  if (!app) throw new Error("Application not found");
  if (app.order) return app.order;

  const breakdown = (app.premiumBreakdown as PremiumBreakdown | null) ?? {
    basicPremium: Number(app.totalPremium),
    levies: Number(app.levies ?? 0),
    taxes: Number(app.taxes ?? 0),
    stampDuty: Number(app.stampDuty ?? 0),
    totalPremium: Number(app.totalPremium),
  };

  const formData = (app.formData as Record<string, unknown>) ?? {};
  const coverType = formData.coverType ?? formData.cover_type ?? "Standard cover";

  const order = await prisma.order.create({
    data: {
      orderNumber: await generateOrderNumber(),
      userId: app.userId,
      applicationId: app.id,
      status: "PENDING_PAYMENT",
      insuranceName: app.product.name,
      coverageSummary: String(coverType),
      subtotal: breakdown.basicPremium,
      levies: breakdown.levies,
      taxes: breakdown.taxes,
      stampDuty: breakdown.stampDuty,
      totalAmount: breakdown.totalPremium,
      currency: "KES",
    },
  });

  await prisma.insuranceApplication.update({
    where: { id: app.id },
    data: { status: "PENDING_PAYMENT" },
  });

  return order;
}

export { findOrCreateCustomerUser } from "@/lib/quote-wizard/service";
