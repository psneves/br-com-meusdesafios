import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/terms", "/privacy"],
      disallow: ["/today", "/explore", "/leaderboard", "/profile", "/settings", "/api/"],
    },
    sitemap: "https://meusdesafios.com.br/sitemap.xml",
  };
}
