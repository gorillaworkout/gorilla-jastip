/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js 15: suppressHydrationWarning tidak lagi valid di experimental
  // Jika ingin mengabaikan mismatch tertentu, gunakan suppressHydrationWarning per-elemen React
}

export default nextConfig
