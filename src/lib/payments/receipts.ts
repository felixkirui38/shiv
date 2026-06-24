import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.receipt.count({
    where: { issuedAt: { gte: new Date(`${year}-01-01`) } },
  });
  return `RCP-${year}-${String(count + 1).padStart(5, "0")}`;
}

interface PdfLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePdfInput {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: PdfLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
}

export async function generateInvoicePdfBuffer(input: InvoicePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#002B30").text("INVOICE", { align: "right" });
    doc.fontSize(10).fillColor("#333");
    doc.text(`Invoice #: ${input.invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString("en-KE")}`);
    doc.text(`Status: ${input.status}`);
    doc.moveDown();

    doc.text("Bill To:");
    doc.text(input.customerName);
    doc.text(input.customerEmail);
    doc.moveDown();

    input.items.forEach((item) => {
      doc.text(
        `${item.description} — ${item.quantity} x ${input.currency} ${item.unitPrice.toLocaleString()} = ${item.total.toLocaleString()}`
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: ${input.currency} ${input.subtotal.toLocaleString()}`);
    doc.text(`Tax: ${input.currency} ${input.tax.toLocaleString()}`);
    doc.fontSize(12).text(`Total: ${input.currency} ${input.total.toLocaleString()}`);

    doc.end();
  });
}

export async function generateReceiptPdfBuffer(params: {
  receiptNumber: string;
  paymentId: string;
  amount: number;
  currency: string;
  customerName: string;
  description?: string;
  paidAt: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#002B30").text("PAYMENT RECEIPT", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#333");
    doc.text(`Receipt #: ${params.receiptNumber}`);
    doc.text(`Payment ID: ${params.paymentId}`);
    doc.text(`Date: ${params.paidAt.toLocaleDateString("en-KE")}`);
    doc.moveDown();
    doc.text(`Received from: ${params.customerName}`);
    doc.text(`Description: ${params.description ?? "Insurance Premium"}`);
    doc.moveDown();
    doc
      .fontSize(16)
      .fillColor("#002B30")
      .text(`Amount Paid: ${params.currency} ${params.amount.toLocaleString()}`, {
        align: "center",
      });
    doc.end();
  });
}

export async function issueReceipt(paymentId: string) {
  const existing = await prisma.receipt.findUnique({ where: { paymentId } });
  if (existing) return existing;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });
  if (!payment || payment.status !== "SUCCEEDED") return null;

  const receiptNumber = await generateReceiptNumber();
  const pdfBuffer = await generateReceiptPdfBuffer({
    receiptNumber,
    paymentId: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    customerName: `${payment.user.firstName ?? ""} ${payment.user.lastName ?? ""}`.trim(),
    description: payment.description ?? undefined,
    paidAt: payment.paidAt ?? new Date(),
  });

  let pdfUrl: string | undefined;
  try {
    const base64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, `receipts/${paymentId}`);
    pdfUrl = upload.secure_url;
  } catch {
    // optional
  }

  const receipt = await prisma.receipt.create({
    data: { paymentId, receiptNumber, pdfUrl },
  });

  if (pdfUrl) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { receiptUrl: pdfUrl },
    });
  }

  return receipt;
}
