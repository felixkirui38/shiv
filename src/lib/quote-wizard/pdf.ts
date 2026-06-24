import PDFDocument from "pdfkit";
import type { QuoteWizardData } from "@/types/quote-wizard";

interface PdfInput {
  quoteNumber: string;
  productName: string;
  estimatedPremium: number;
  validUntil: Date;
  wizardData: QuoteWizardData;
}

export async function generateQuotePdfBuffer(input: PdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const brand = "Shiv Insurance Brokers";
    const customer = input.wizardData.customer;
    const premium = input.wizardData.premium?.result;

    doc
      .fontSize(22)
      .fillColor("#002B30")
      .text(brand, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor("#333").text("Insurance Quotation", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(10).fillColor("#666");
    doc.text(`Quote Number: ${input.quoteNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString("en-KE")}`);
    doc.text(`Valid Until: ${input.validUntil.toLocaleDateString("en-KE")}`);
    doc.moveDown(1);

    doc.fontSize(12).fillColor("#002B30").text("Product");
    doc.fontSize(10).fillColor("#333").text(input.productName);
    doc.moveDown(0.75);

    if (customer) {
      doc.fontSize(12).fillColor("#002B30").text("Customer Details");
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(`${customer.firstName} ${customer.lastName}`)
        .text(`Email: ${customer.email}`)
        .text(`Phone: ${customer.phone}`)
        .text(`ID: ${customer.idNumber} · KRA PIN: ${customer.kraPin}`);
      doc.moveDown(0.75);
    }

    if (input.wizardData.coverage?.factors) {
      doc.fontSize(12).fillColor("#002B30").text("Coverage Options");
      doc.fontSize(10).fillColor("#333");
      for (const [key, value] of Object.entries(input.wizardData.coverage.factors)) {
        doc.text(`${key}: ${String(value)}`);
      }
      doc.moveDown(0.75);
    }

    doc.fontSize(12).fillColor("#002B30").text("Premium Summary");
    doc.fontSize(10).fillColor("#333");
    if (premium) {
      doc.text(`Base Premium: KES ${premium.basePremium.toLocaleString()}`);
      for (const adj of premium.adjustments) {
        doc.text(`${adj.name}: KES ${adj.amount.toLocaleString()}`);
      }
      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .fillColor("#002B30")
        .text(`Total Annual Premium: KES ${premium.totalPremium.toLocaleString()}`);
      doc
        .fontSize(10)
        .fillColor("#666")
        .text(`Monthly equivalent: KES ${premium.monthlyPremium.toLocaleString()}`);
    } else {
      doc.text(`Estimated Premium: KES ${input.estimatedPremium.toLocaleString()}`);
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#888")
      .text(
        "This quotation is indicative and subject to underwriting approval. " +
          "Terms and conditions apply. Licensed Insurance Broker — IRA/06/267/2024.",
        { align: "center" }
      );

    doc.end();
  });
}
