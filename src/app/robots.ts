import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://moltstream.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/(payload)/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
