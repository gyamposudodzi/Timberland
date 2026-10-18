import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { env } from "@/lib/env";

const providers = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = String(credentials.email).toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await verifyPassword(String(credentials.password), user.passwordHash))) {
        // Uniform failure: do not reveal whether the email exists.
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
  ...(env.googleEnabled
    ? [Google({ clientId: env.google.id!, clientSecret: env.google.secret! })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers,
});
