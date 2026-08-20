"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import { VerifySearch } from "@/features/verify/VerifySearch";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";

export default function VerifyPage() {
  const configured = isContractsConfigured();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-brand/10">
            <ShieldCheck className="h-8 w-8 text-amber-brand" />
          </div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-amber-brand">
            Public verification
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
            Verify shipment custody
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-muted">
            Read-only proof-of-handoff verification from Stellar Soroban — no
            wallet required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12"
        >
          {configured ? (
            <VerifySearch />
          ) : (
            <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
