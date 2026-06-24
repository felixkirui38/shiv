import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listCustomerClaims, getCustomerPolicies } from "@/lib/claims/queries";
import { generateClaimNumber } from "@/lib/claims/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { createClaimSchema } from "@/validations/claim";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  if (searchParams.get("policies") === "1") {
    const policies = await getCustomerPolicies(session.user.id);
    return apiSuccess(policies);
  }

  const claims = await listCustomerClaims(session.user.id);
  return apiSuccess(claims);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const body = createClaimSchema.parse(await req.json());

    const policy = await prisma.policy.findFirst({
      where: { id: body.policyId, userId: session.user.id },
      include: { product: { select: { name: true } } },
    });
    if (!policy) return apiError("Policy not found", 404);

    const claimNumber = await generateClaimNumber();

    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        policyId: policy.id,
        userId: session.user.id,
        status: "DRAFT",
        incidentDate: new Date(body.incidentDate),
        description: body.description,
        claimAmount: body.claimAmount,
      },
      include: {
        policy: { select: { policyNumber: true, product: { select: { name: true } } } },
      },
    });

    return apiSuccess(
      {
        id: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        policyNumber: claim.policy.policyNumber,
        productName: claim.policy.product.name,
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create claim";
    return apiError(message, 400);
  }
}
