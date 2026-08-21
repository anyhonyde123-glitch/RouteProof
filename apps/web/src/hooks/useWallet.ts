"use client";

import { create } from "zustand";
import { humanizeSorobanError } from "@/lib/errors";
import { getNetworkPassphrase } from "@/lib/stellar";
import type { WalletState } from "@/lib/types";
import {
  connectWallet,
  disconnectWalletSession,
  signWithWallet,
} from "@/lib/wallets/adapters";
import {
  WALLET_OPTIONS,
  WALLET_STORAGE_KEY,
  type WalletId,
} from "@/lib/wallets/types";

interface WalletStore extends WalletState {
  walletId: WalletId | null;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  connect: (walletId?: WalletId) => Promise<string | null>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

function readStoredWalletId(): WalletId | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(WALLET_STORAGE_KEY);
  if (!value) return null;
  return WALLET_OPTIONS.some((w) => w.id === value)
    ? (value as WalletId)
    : null;
}

function persistWalletId(walletId: WalletId | null): void {
  if (typeof window === "undefined") return;
  if (walletId) {
    window.localStorage.setItem(WALLET_STORAGE_KEY, walletId);
  } else {
    window.localStorage.removeItem(WALLET_STORAGE_KEY);
  }
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  status: "disconnected",
  publicKey: null,
  walletId: null,
  error: null,
  pickerOpen: false,

  openPicker: () => set({ pickerOpen: true, error: null }),
  closePicker: () => set({ pickerOpen: false }),

  connect: async (walletId) => {
    if (!walletId) {
      const stored = get().walletId ?? readStoredWalletId();
      if (stored) {
        return get().connect(stored);
      }
      set({ pickerOpen: true, error: null });
      return null;
    }

    set({ status: "connecting", error: null, pickerOpen: false });
    try {
      const session = await connectWallet(walletId);
      persistWalletId(session.walletId);
      set({
        status: "connected",
        publicKey: session.publicKey,
        walletId: session.walletId,
        error: null,
        pickerOpen: false,
      });
      return session.publicKey;
    } catch (error) {
      const message = humanizeSorobanError(error);
      set({
        status: "error",
        error: message,
        publicKey: null,
        walletId: null,
        pickerOpen: true,
      });
      return null;
    }
  },

  disconnect: () => {
    disconnectWalletSession(get().walletId);
    persistWalletId(null);
    set({
      status: "disconnected",
      publicKey: null,
      walletId: null,
      error: null,
      pickerOpen: false,
    });
  },

  signTransaction: async (xdr: string) => {
    const { publicKey, walletId } = get();
    if (!publicKey || !walletId) {
      throw new Error("Connect a wallet before signing transactions.");
    }
    return signWithWallet(walletId, xdr, publicKey, getNetworkPassphrase());
  },
}));

export function useWallet() {
  const status = useWalletStore((state) => state.status);
  const publicKey = useWalletStore((state) => state.publicKey);
  const walletId = useWalletStore((state) => state.walletId);
  const error = useWalletStore((state) => state.error);
  const pickerOpen = useWalletStore((state) => state.pickerOpen);
  const connect = useWalletStore((state) => state.connect);
  const disconnect = useWalletStore((state) => state.disconnect);
  const openPicker = useWalletStore((state) => state.openPicker);
  const closePicker = useWalletStore((state) => state.closePicker);
  const signTransaction = useWalletStore((state) => state.signTransaction);

  const walletName =
    WALLET_OPTIONS.find((w) => w.id === walletId)?.name ?? null;

  return {
    status,
    publicKey,
    walletId,
    walletName,
    error,
    pickerOpen,
    connect,
    disconnect,
    openPicker,
    closePicker,
    signTransaction,
    isConnected: status === "connected" && !!publicKey,
  };
}
