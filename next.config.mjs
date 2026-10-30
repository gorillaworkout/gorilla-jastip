/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Paket native/Node khusus server (renderer PDF) tidak ikut di-bundle webpack.
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas", "canvas"],
  experimental: {
    // File worker pdf.js dimuat dinamis (bukan import statis) sehingga tidak
    // ikut ter-trace ke bundle serverless Vercel; paksa sertakan di rute ini.
    outputFileTracingIncludes: {
      "/api/uangkuh/extract": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    },
  },
  images: {
    unoptimized: true,
  },
  // Next.js 15: suppressHydrationWarning tidak lagi valid di experimental
  // Jika ingin mengabaikan mismatch tertentu, gunakan suppressHydrationWarning per-elemen React
  async headers() {
    return [
      {
        // Service worker tidak boleh di-cache lama, kalau tidak update
        // PWA tidak akan pernah sampai ke pengguna.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/site.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ]
  },
}

export default nextConfig
