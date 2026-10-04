import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the app root so Turbopack doesn't walk up and pick a parent lockfile
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
