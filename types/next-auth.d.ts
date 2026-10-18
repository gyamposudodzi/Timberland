import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "CUSTOMER" | "STAFF" | "ADMIN";
    };
  }

  interface User extends DefaultUser {
    id: string;
    role?: "CUSTOMER" | "STAFF" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "CUSTOMER" | "STAFF" | "ADMIN";
  }
}
