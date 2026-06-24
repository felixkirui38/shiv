import { runPremiumCalculation } from "@/lib/premium-engine/calculate";
import { apiSuccess, apiError } from "@/lib/api-response";
import { calculateInputSchema } from "@/validations/premium-formula";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = calculateInputSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await runPremiumCalculation(
      slug,
      { factors: parsed.factors },
      {
        source: "PUBLIC",
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
        versionId: parsed.versionId,
      }
    );

    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calculation failed";
    return apiError(message, 400);
  }
}
