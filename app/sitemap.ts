import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jastipdigw.gorillaworkout.id"
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jastipers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]
}
