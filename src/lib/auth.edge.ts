import type { NextAuthConfig } from "next-auth";

export const edgeAuthConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/portal/dashboard",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPortal = nextUrl.pathname.startsWith("/portal");
      const isAdmin = nextUrl.pathname.startsWith("/admin");

      if (isPortal || isAdmin) {
        if (!isLoggedIn) return false;
        if (isAdmin) {
          const role = auth?.user?.role;
          return role != null && role !== "CUSTOMER";
        }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
