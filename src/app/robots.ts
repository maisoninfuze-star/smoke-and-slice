import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here is secret, but there is no reason to spend crawl budget
      // on a customer's order status or the kitchen dashboard.
      disallow: ["/api/", "/admin", "/account", "/track/", "/checkout"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
