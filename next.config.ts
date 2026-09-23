import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Contributor avatars. The URL is derived from the numeric account id
    // already stored with each analysis, so no API call and no extra
    // field are needed — but next/image refuses remote hosts that are
    // not listed here, which is the point: it stops the app fetching and
    // re-serving images from anywhere a URL might come to point.
    remotePatterns: [
      new URL("https://avatars.githubusercontent.com/u/**"),
      new URL("https://gitlab.com/uploads/**"),
      new URL("https://secure.gravatar.com/avatar/**"),
    ],
  },

  // Produces a minimal .next/standalone/ server (only the traced
  // dependencies a request actually needs) — see Dockerfile.
  output: "standalone",
};

export default nextConfig;
