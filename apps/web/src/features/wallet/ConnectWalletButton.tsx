"use client";

import { Wallet } from "lucide-react";
import { truncateAddress } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";
import { WalletPickerModal } from "./WalletPickerModal";

export function ConnectWalletButton({ size = "md" }: { size?: "sm" | "md" }) {
  const {
    status,
    publicKey,
    walletName,
    connect,
    disconnect,
    isConnected,
  } = useWallet();

  if (isConnected && publicKey) {
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:inline">
            {walletName ? `${walletName} · ` : ""}
            {truncateAddress(publicKey, 6)}
          </span>
          <Button variant="secondary" size={size} onClick={disconnect}>
            Disconnect
          </Button>
        </div>
        <WalletPickerModal />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <Button
          size={size}
          loading={status === "connecting"}
          onClick={() => void connect()}
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </Button>
      </div>
      <WalletPickerModal />
    </>
  );
}
