import type { NextConfig } from "next";

// See lib/api.ts for why this differs from NEXT_PUBLIC_API_URL — the
// rewrite runs on the Next.js server, so it needs the server-reachable
// address (e.g. the Docker Compose service name), not the public one.
const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // standalone output is for the self-hosted Docker image (web/Dockerfile);
  // Vercel provides its own build output and errors on this mode (missing
  // .nft.json trace files), so skip it there.
  output: process.env.VERCEL ? undefined : "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
