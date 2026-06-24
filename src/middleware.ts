import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/lib/auth.edge";

export default NextAuth(edgeAuthConfig).auth;

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
