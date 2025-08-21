import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jastipdigw.com"
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/periods`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pengeluaran`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pendapatan`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/analytics`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]
}


