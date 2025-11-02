/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  // Exclude platform-specific binaries from deployment bundle
  // Note: Vercel handles this automatically, but this helps for other deployments
  outputFileTracingExcludes: {
    "*": [
      "./lib/generated/prisma/**/*",
      "./node_modules/@prisma/client/libquery_engine-darwin-arm64.dylib.node",
      "**/*.dylib.node",
      "**/*.so",
    ],
  },
};

export default nextConfig;
