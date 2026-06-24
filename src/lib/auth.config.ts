import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { edgeAuthConfig } from "@/lib/auth.edge";

function resolveAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "development") {
    return "shiv-dev-auth-secret-do-not-use-in-production";
  }
  return undefined;
}

export const authConfig: NextAuthConfig = {
  ...edgeAuthConfig,
  secret: resolveAuthSecret(),
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = (credentials.email as string).trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user?.passwordHash) return null;
          if (user.status === "SUSPENDED" || user.status === "INACTIVE") return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
};
