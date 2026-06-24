import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/payments/receipts";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createInvoiceForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true, policy: { include: { product: true } } },
  });
  if (!payment) throw new Error("Payment not found");

  const invoiceNumber = await generateInvoiceNumber();
  const amount = Number(payment.amount);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      userId: payment.userId,
      policyId: payment.policyId,
      status: payment.status === "SUCCEEDED" ? "PAID" : "SENT",
      subtotal: amount,
      total: amount,
      currency: payment.currency,
      dueDate: new Date(Date.now() + 14 * 86400000),
      paidAt: payment.paidAt,
      lineItems: {
        create: [
          {
            description:
              payment.description ??
              payment.policy?.product?.name ??
              "Insurance Premium",
            quantity: 1,
            unitPrice: amount,
            total: amount,
          },
        ],
      },
    },
    include: { lineItems: true, user: true },
  });

  const pdfBuffer = await generateInvoicePdfBuffer({
    invoiceNumber: invoice.invoiceNumber,
    customerName: `${payment.user.firstName ?? ""} ${payment.user.lastName ?? ""}`.trim(),
    customerEmail: payment.user.email,
    items: invoice.lineItems.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
    })),
    subtotal: amount,
    tax: 0,
    total: amount,
    currency: payment.currency,
    status: invoice.status,
  });

  try {
    const base64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, `invoices/${invoice.id}`);
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: upload.secure_url },
    });
  } catch {
    // PDF upload optional without Cloudinary
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { invoiceId: invoice.id },
  });

  return invoice;
}

export async function markInvoicePaid(invoiceId: string) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date() },
  });
}
