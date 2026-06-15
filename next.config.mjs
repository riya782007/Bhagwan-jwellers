/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "newvora.in", "*.vercel.app"] }
  }
};

export default nextConfig;
