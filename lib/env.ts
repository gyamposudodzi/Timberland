import "server-only";

/**
 * Typed, server-side access to environment configuration. Keeping every env
 * read in one place makes the app's external surface explicit and testable.
 */

function str(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalStr(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

export const env = {
  get databaseUrl(): string {
    return str("DATABASE_URL");
  },
  get authSecret(): string {
    return str("AUTH_SECRET");
  },
  get appUrl(): string {
    return str("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },
  get defaultCurrency(): string {
    return str("NEXT_PUBLIC_DEFAULT_CURRENCY", "USD");
  },

  // Email / notifications (all optional — the app degrades to a console
  // transport when SMTP is not configured).
  get smtp() {
    return {
      host: optionalStr("SMTP_HOST"),
      port: Number(optionalStr("SMTP_PORT") ?? 587),
      user: optionalStr("SMTP_USER"),
      password: optionalStr("SMTP_PASSWORD"),
      from: optionalStr("EMAIL_FROM") ?? "Timberland <no-reply@timberland.example>",
    };
  },

  get emailEnabled(): boolean {
    const { host, user, password } = this.smtp;
    return Boolean(host && user && password);
  },

  get google() {
    return {
      id: optionalStr("AUTH_GOOGLE_ID"),
      secret: optionalStr("AUTH_GOOGLE_SECRET"),
    };
  },

  get googleEnabled(): boolean {
    return Boolean(this.google.id && this.google.secret);
  },
};

export type Env = typeof env;
