import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error: Suppress TS error for older typings since Next Config validly parses this
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
