import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { emitPasswordReset } from "@/lib/notifications";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return apiError("Email is required", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return apiSuccess({ message: "If an account exists, a reset link has been sent." });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  await emitPasswordReset({
    email: user.email,
    phone: user.phone,
    customerName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    resetToken: token,
  });

  return apiSuccess({ message: "If an account exists, a reset link has been sent." });
}
