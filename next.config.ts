import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal .next/standalone/ server (only the traced
  // dependencies a request actually needs) — see Dockerfile.
  output: "standalone",
};

export default nextConfig;
