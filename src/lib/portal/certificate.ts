import PDFDocument from "pdfkit";

export async function generatePolicyCertificateBuffer(params: {
  policyNumber: string;
  productName: string;
  customerName: string;
  premium: number;
  coverageAmount: number | null;
  startDate: string | null;
  endDate: string | null;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke("#002B30");

    doc.fontSize(28).fillColor("#002B30").text("CERTIFICATE OF INSURANCE", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#5A5A5A").text("Shiv Insurance Brokers", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).fillColor("#333");
    doc.text(`This certifies that ${params.customerName} is covered under:`);
    doc.moveDown();

    doc.fontSize(16).fillColor("#002B30").text(params.productName, { align: "center" });
    doc.moveDown();

    const rows: [string, string][] = [
      ["Policy Number", params.policyNumber],
      ["Annual Premium", `KES ${params.premium.toLocaleString()}`],
    ];
    if (params.coverageAmount) {
      rows.push(["Coverage Amount", `KES ${params.coverageAmount.toLocaleString()}`]);
    }
    if (params.startDate) {
      rows.push(["Start Date", new Date(params.startDate).toLocaleDateString("en-KE")]);
    }
    if (params.endDate) {
      rows.push(["End Date", new Date(params.endDate).toLocaleDateString("en-KE")]);
    }

    rows.forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#5A5A5A").text(label, { continued: true });
      doc.fillColor("#1C1C1C").text(`  ${value}`);
    });

    doc.moveDown(3);
    doc
      .fontSize(9)
      .fillColor("#999")
      .text(
        "This certificate is issued electronically and is valid without signature. For verification, contact Shiv Insurance Brokers.",
        { align: "center" }
      );

    doc.end();
  });
}
