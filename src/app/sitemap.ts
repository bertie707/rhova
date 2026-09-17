import type { MetadataRoute } from "next";

// Set NEXT_PUBLIC_SITE_URL once this is deployed for real — this fallback
// just keeps local dev from erroring.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
