import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { generatePolicyCertificateBuffer } from "@/lib/portal/certificate";
import { generatePurchasePolicyNumber } from "@/lib/purchase/number";

const orderInclude = {
  policy: true,
  application: { include: { product: true, policy: true } },
} as const;

export async function issuePolicyFromPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!payment) throw new Error("Payment not found");

  const order = payment.orderId
    ? await prisma.order.findUnique({
        where: { id: payment.orderId },
        include: orderInclude,
      })
    : payment.applicationId
      ? await prisma.order.findUnique({
          where: { applicationId: payment.applicationId },
          include: orderInclude,
        })
      : null;

  if (!order) return null;
  if (order.policy) return order.policy;

  const application = order.application;
  if (!application || application.policy) return application?.policy ?? null;

  const userId = payment.userId ?? application.userId ?? order.userId;
  if (!userId) throw new Error("Customer account required for policy issuance");

  const formData = (application.formData as Record<string, unknown>) ?? {};
  const customerName =
    String(formData.fullName ?? "") ||
    `${payment.user?.firstName ?? ""} ${payment.user?.lastName ?? ""}`.trim() ||
    payment.user?.email ||
    "Policyholder";

  const coverageAmount = Number(
    formData.vehicleValue ??
      formData.vehicle_value ??
      formData.coverageAmount ??
      formData.coverage_amount ??
      formData.propertyValue ??
      formData.shipmentValue ??
      0
  );

  const policyNumber = await generatePurchasePolicyNumber();
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const policy = await prisma.policy.create({
    data: {
      policyNumber,
      userId,
      productId: application.productId,
      applicationId: application.id,
      orderId: order.id,
      status: "ACTIVE",
      premium: order.totalAmount,
      coverageAmount: coverageAmount > 0 ? coverageAmount : null,
      startDate,
      endDate,
      renewalDate: endDate,
      formData: application.formData as object,
    },
  });

  const pdfBuffer = await generatePolicyCertificateBuffer({
    policyNumber,
    productName: application.product.name,
    customerName,
    premium: Number(order.totalAmount),
    coverageAmount: coverageAmount > 0 ? coverageAmount : null,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const base64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
  const upload = await uploadToCloudinary(base64, `policies/${policy.id}`);

  const media = await prisma.media.create({
    data: {
      filename: upload.public_id,
      originalName: `${policyNumber}-certificate.pdf`,
      mimeType: "application/pdf",
      size: pdfBuffer.length,
      type: "PDF",
      url: upload.secure_url,
      publicId: upload.public_id,
    },
  });

  await prisma.policyDocument.create({
    data: {
      policyId: policy.id,
      mediaId: media.id,
      name: "Certificate of Insurance",
      type: "certificate",
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "POLICY_GENERATED", paidAt: payment.paidAt ?? new Date() },
  });

  await prisma.insuranceApplication.update({
    where: { id: application.id },
    data: { status: "POLICY_ISSUED" },
  });

  try {
    const { emitPolicyApproved } = await import("@/lib/notifications");
    await emitPolicyApproved({
      userId,
      email: payment.user?.email ?? String(formData.email ?? ""),
      phone: payment.user?.phone ?? (formData.phone as string | undefined),
      customerName,
      policyNumber,
      productName: application.product.name,
      policyId: policy.id,
    });
  } catch {
    // non-blocking
  }

  return policy;
}
