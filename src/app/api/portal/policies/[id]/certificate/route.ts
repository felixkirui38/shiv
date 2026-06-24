import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePolicyCertificateBuffer } from "@/lib/portal/certificate";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const policy = await prisma.policy.findFirst({
    where: { id, userId: session.user.id },
    include: {
      product: { select: { name: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  const customerName =
    `${policy.user.firstName ?? ""} ${policy.user.lastName ?? ""}`.trim() ||
    policy.user.email;

  const buffer = await generatePolicyCertificateBuffer({
    policyNumber: policy.policyNumber,
    productName: policy.product.name,
    customerName,
    premium: Number(policy.premium),
    coverageAmount: policy.coverageAmount ? Number(policy.coverageAmount) : null,
    startDate: policy.startDate?.toISOString() ?? null,
    endDate: policy.endDate?.toISOString() ?? null,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${policy.policyNumber}.pdf"`,
    },
  });
}
