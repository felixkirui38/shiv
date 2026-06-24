import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json();

    if (!email || !password) {
      return apiError("Email and password are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return apiSuccess(user, 201);
  } catch {
    return apiError("Registration failed", 500);
  }
}
