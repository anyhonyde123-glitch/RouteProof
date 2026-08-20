import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@stellar/stellar-sdk",
    "@stellar/stellar-base",
    "sodium-native",
    "sodium-universal",
  ],
};

export default nextConfig;
