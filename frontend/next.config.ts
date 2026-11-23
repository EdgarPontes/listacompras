import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Raiz do monorepo: garante o tracing correto dos arquivos no build.
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  poweredByHeader: false,
};

export default nextConfig;
