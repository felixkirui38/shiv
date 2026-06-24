import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return apiError("Token and password are required", 400);
  if (password.length < 8) return apiError("Password must be at least 8 characters", 400);

  const record = await prisma.verificationToken.findFirst({
    where: { token, expires: { gt: new Date() } },
  });
  if (!record) return apiError("Invalid or expired reset link", 400);

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email: record.identifier },
    data: { passwordHash },
  });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

  return apiSuccess({ message: "Password updated successfully" });
}
