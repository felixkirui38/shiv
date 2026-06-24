import { prisma } from "@/lib/prisma";

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);

  const count = await prisma.quote.count({
    where: { createdAt: { gte: startOfYear } },
  });

  return `Q-${year}-${String(count + 1).padStart(5, "0")}`;
}
