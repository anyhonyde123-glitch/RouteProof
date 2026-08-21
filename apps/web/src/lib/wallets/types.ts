export type WalletId = "freighter" | "xbull" | "lobstr" | "albedo";

export interface WalletOption {
  id: WalletId;
  name: string;
  description: string;
  installUrl: string;
  accent: string;
}

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "freighter",
    name: "Freighter",
    description: "Browser extension by Stellar Development Foundation",
    installUrl: "https://www.freighter.app/",
    accent: "#3E1BDB",
  },
  {
    id: "xbull",
    name: "xBull",
    description: "Extension + PWA wallet for Stellar",
    installUrl: "https://xbull.app/",
    accent: "#00B2FF",
  },
  {
    id: "lobstr",
    name: "LOBSTR",
    description: "Popular Stellar wallet with browser signer",
    installUrl: "https://lobstr.co/",
    accent: "#00C26F",
  },
  {
    id: "albedo",
    name: "Albedo",
    description: "Web wallet — works in any browser",
    installUrl: "https://albedo.link/",
    accent: "#F6C343",
  },
];

export const WALLET_STORAGE_KEY = "routeproof.walletId";
