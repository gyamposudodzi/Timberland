import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * This module must NOT import anything Node-only (Prisma, bcrypt, nodemailer).
 * It is consumed by `middleware.ts` and merged into the full config in
 * `lib/auth.ts`. The `jwt`/`session` callbacks here rely only on values already
 * present on the token (populated by `authorize` in the Node runtime).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isProtected = pathname.startsWith("/account");
      if (isProtected) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CUSTOMER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "CUSTOMER";
      }
      return session;
    },
  },
};
