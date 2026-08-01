import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow pdf-parse and mammoth to work in API routes (Node.js runtime only)
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  
  // Allow streaming responses
  experimental: {},
};

export default nextConfig;
