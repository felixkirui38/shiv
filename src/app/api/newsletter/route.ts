import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return apiError("Valid email is required");
    }

    await prisma.lead.create({
      data: {
        firstName: "Newsletter",
        email,
        source: "newsletter",
        status: "NEW",
        notes: "Newsletter subscription",
      },
    });

    return apiSuccess({ subscribed: true }, 201);
  } catch {
    return apiSuccess({ subscribed: true });
  }
}
