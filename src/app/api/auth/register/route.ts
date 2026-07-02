import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withDbRetry, isDbConnectionError, sanitizeApiErrorMessage } from "@/lib/db-retry";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

async function parseRegisterPayload(req: Request): Promise<RegisterPayload | null> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as Partial<RegisterPayload>;
    return {
      email: body.email?.trim().toLowerCase() ?? "",
      password: body.password ?? "",
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      phone: body.phone?.trim(),
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    return {
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      password: String(form.get("password") ?? ""),
      firstName: String(form.get("firstName") ?? "").trim() || undefined,
      lastName: String(form.get("lastName") ?? "").trim() || undefined,
      phone: String(form.get("phone") ?? "").trim() || undefined,
    };
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const payload = await parseRegisterPayload(req);
    if (!payload) {
      return apiError("Invalid request format. Send JSON or form data.", 400);
    }

    const { email, password, firstName, lastName, phone } = payload;

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    if (password.length < 8) {
      return apiError("Password must be at least 8 characters", 400);
    }

    const existing = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email } })
    );
    if (existing) return apiError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await withDbRetry(() =>
      prisma.user.create({
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
      })
    );

    return apiSuccess(user, 201);
  } catch (error) {
    console.error("[auth/register]", error);
    if (isDbConnectionError(error)) {
      return apiError(
        "Registration is temporarily unavailable. Please try again in a moment.",
        503
      );
    }
    const message =
      error instanceof Error
        ? sanitizeApiErrorMessage(error.message, "Registration failed. Please try again later.")
        : "Registration failed. Please try again later.";
    return apiError(message, 500);
  }
}
