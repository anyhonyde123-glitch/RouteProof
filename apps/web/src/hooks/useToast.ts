"use client";

import { create } from "zustand";
import type { ToastItem } from "@/lib/types";

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    window.setTimeout(() => get().dismiss(id), 5000);
  },
  dismiss: (id) =>
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

export function useToast() {
  const push = useToastStore((state) => state.push);
  return {
    success: (title: string, description?: string) =>
      push({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      push({ title, description, variant: "error" }),
    info: (title: string, description?: string) =>
      push({ title, description, variant: "info" }),
  };
}
