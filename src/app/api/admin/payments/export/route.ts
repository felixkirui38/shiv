import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUS_LABELS, PROVIDER_LABELS } from "@/lib/payments/types";
import { NextResponse } from "next/server";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "payments:view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const provider = searchParams.get("provider") ?? undefined;

  const payments = await prisma.payment.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(provider ? { provider: provider as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  const header =
    "ID,Date,Customer,Email,Amount,Currency,Status,Provider,Type,Plan,Paid At\n";
  const rows = payments
    .map((p) => {
      const name = `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim();
      return [
        p.id,
        p.createdAt.toISOString(),
        `"${name}"`,
        p.user.email,
        Number(p.amount),
        p.currency,
        PAYMENT_STATUS_LABELS[p.status],
        PROVIDER_LABELS[p.provider],
        p.type,
        p.planType,
        p.paidAt?.toISOString() ?? "",
      ].join(",");
    })
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payments-export-${Date.now()}.csv"`,
    },
  });
}
