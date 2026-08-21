import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@stellar/stellar-sdk",
    "@stellar/stellar-base",
    "sodium-native",
    "sodium-universal",
  ],
  transpilePackages: [
    "@albedo-link/intent",
    "@creit.tech/xbull-wallet-connect",
    "@lobstrco/signer-extension-api",
  ],
};

export default nextConfig;
