"use client";

import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useWallet } from "@/hooks/useWallet";
import { WALLET_OPTIONS, type WalletId } from "@/lib/wallets/types";
import { cn } from "@/lib/cn";

function WalletMark({ id, accent }: { id: WalletId; accent: string }) {
  const letter =
    id === "freighter"
      ? "F"
      : id === "xbull"
        ? "X"
        : id === "lobstr"
          ? "L"
          : "A";

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-inner"
      style={{ background: accent }}
      aria-hidden
    >
      {letter}
    </span>
  );
}

export function WalletPickerModal() {
  const { pickerOpen, closePicker, connect, status, error } = useWallet();

  return (
    <Modal
      open={pickerOpen}
      onClose={closePicker}
      title="Connect wallet"
      description="Choose Freighter, xBull, LOBSTR, or Albedo — then approve Testnet access."
      className="max-w-md"
    >
      <div className="space-y-2">
        {WALLET_OPTIONS.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            disabled={status === "connecting"}
            onClick={() => void connect(wallet.id)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl border border-slate-700/70 bg-navy-950/60 px-3 py-3 text-left transition",
              "hover:border-amber-brand/40 hover:bg-navy-950",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <WalletMark id={wallet.id} accent={wallet.accent} />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-white">{wallet.name}</span>
              <span className="mt-0.5 block text-xs text-slate-muted">
                {wallet.description}
              </span>
            </span>
            <a
              href={wallet.installUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="rounded-lg p-2 text-slate-muted opacity-0 transition hover:bg-slate-800 hover:text-amber-brand group-hover:opacity-100"
              aria-label={`Install ${wallet.name}`}
              title="Install"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </button>
        ))}
      </div>

      {status === "connecting" ? (
        <p className="mt-4 text-center text-xs text-slate-muted">
          Waiting for wallet approval…
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-center text-[11px] text-slate-muted">
          Use Testnet network in your wallet settings before signing.
        </p>
      )}
    </Modal>
  );
}
