import type { NextConfig } from "next";

// Where the Express API lives. Locally: http://localhost:4000.
// On Vercel: the URL of your deployed API project. Must be set at BUILD time (rewrites are baked in).
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The browser only ever talks to the Next.js site. Anything under /api is forwarded to the
  // Express API, so auth cookies are first-party and no CORS setup is needed.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
