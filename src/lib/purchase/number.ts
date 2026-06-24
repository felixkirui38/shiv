import { prisma } from "@/lib/prisma";

async function nextSequence(prefix: string, field: "applicationNumber" | "orderNumber" | "policyNumber") {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  if (field === "applicationNumber") {
    const count = await prisma.insuranceApplication.count({
      where: { applicationNumber: { startsWith: pattern } },
    });
    return `${pattern}${String(count + 1).padStart(6, "0")}`;
  }

  if (field === "orderNumber") {
    const count = await prisma.order.count({
      where: { orderNumber: { startsWith: pattern } },
    });
    return `${pattern}${String(count + 1).padStart(6, "0")}`;
  }

  const count = await prisma.policy.count({
    where: { policyNumber: { startsWith: pattern } },
  });
  return `${pattern}${String(count + 1).padStart(6, "0")}`;
}

export function generateApplicationNumber() {
  return nextSequence("APP", "applicationNumber");
}

export function generateOrderNumber() {
  return nextSequence("ORD", "orderNumber");
}

export function generatePurchasePolicyNumber() {
  return nextSequence("POL", "policyNumber");
}
