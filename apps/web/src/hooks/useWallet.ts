"use client";

import {
  isConnected as freighterIsConnected,
  isAllowed,
  getPublicKey,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { create } from "zustand";
import { getNetworkPassphrase } from "@/lib/stellar";
import type { WalletState } from "@/lib/types";
import { humanizeSorobanError } from "@/lib/errors";

interface WalletStore extends WalletState {
  connect: () => Promise<string | null>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

async function ensureFreighter(): Promise<void> {
  const connected = await freighterIsConnected();
  if (!connected) {
    throw new Error(
      "Freighter wallet is not installed. Install Freighter to connect.",
    );
  }
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  status: "disconnected",
  publicKey: null,
  error: null,

  connect: async () => {
    set({ status: "connecting", error: null });
    try {
      await ensureFreighter();
      const allowed = await isAllowed();
      if (!allowed) {
        await setAllowed();
      }
      const address = await getPublicKey();
      if (!address) {
        throw new Error("Freighter did not return a public key.");
      }
      set({ status: "connected", publicKey: address, error: null });
      return address;
    } catch (error) {
      const message = humanizeSorobanError(error);
      set({ status: "error", error: message, publicKey: null });
      return null;
    }
  },

  disconnect: () =>
    set({ status: "disconnected", publicKey: null, error: null }),

  signTransaction: async (xdr: string) => {
    const { publicKey } = get();
    if (!publicKey) {
      throw new Error("Connect Freighter before signing transactions.");
    }
    await ensureFreighter();
    const signedXdr = await freighterSignTransaction(xdr, {
      networkPassphrase: getNetworkPassphrase(),
      accountToSign: publicKey,
    });
    if (!signedXdr) {
      throw new Error("Freighter did not return a signed transaction.");
    }
    return signedXdr;
  },
}));

export function useWallet() {
  const status = useWalletStore((state) => state.status);
  const publicKey = useWalletStore((state) => state.publicKey);
  const error = useWalletStore((state) => state.error);
  const connect = useWalletStore((state) => state.connect);
  const disconnect = useWalletStore((state) => state.disconnect);
  const signTransaction = useWalletStore((state) => state.signTransaction);

  return {
    status,
    publicKey,
    error,
    connect,
    disconnect,
    signTransaction,
    isConnected: status === "connected" && !!publicKey,
  };
}
