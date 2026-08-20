"use client";

import { ToastContainer } from "@/components/ui/Toast";
import { useToastStore } from "@/hooks/useToast";

export function Providers({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
}
