import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limit static page generation concurrency to avoid overwhelming the
  // Supabase free-tier connection pooler during builds (139 pages total).
  // Without this, Next.js spawns too many simultaneous DB connections,
  // causing "Connection terminated unexpectedly" errors.
  experimental: {
    // Cap the number of pages generated in parallel during `next build`.
    // A value of 8 keeps peak Supabase connections safely under the free
    // tier limit while still completing the build in reasonable time.
    staticGenerationMaxConcurrency: 8,
  },
};

export default nextConfig;
