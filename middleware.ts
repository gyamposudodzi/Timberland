import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe middleware. The `authorized` callback in `authConfig` decides
// access; unmatched/allowed requests pass through untouched.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Only guard the authenticated customer area.
  matcher: ["/account/:path*"],
};
