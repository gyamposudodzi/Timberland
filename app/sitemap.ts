import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Only publicly indexable marketing/utility pages. Auth and account routes are
// excluded (and disallowed in robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/track", "/quote", "/pricing", "/help", "/legal", "/login", "/signup"];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.6,
  }));
}
