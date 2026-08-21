"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Link2,
  Route,
  Shield,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    title: "Register participants",
    description:
      "Organizations enroll on-chain with sender, carrier, warehouse, inspector, and receiver roles.",
  },
  {
    title: "Create & track shipments",
    description:
      "Each shipment records origin, destination, cargo hash, and a live custody status on Soroban.",
  },
  {
    title: "Record every handoff",
    description:
      "Pickup, warehouse intake, inspection, delivery, and receiver acceptance produce immutable proofs.",
  },
];

const benefits = [
  "Tamper-evident custody chain for regulated logistics",
  "Role-based authorization enforced by smart contracts",
  "Public verification without exposing private ops data",
  "Settlement only after receiver-confirmed delivery",
];

const custodySteps = [
  { icon: Truck, label: "Pickup recorded" },
  { icon: Route, label: "In transit" },
  { icon: Shield, label: "Inspection passed" },
  { icon: CheckCircle2, label: "Delivered" },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative min-h-[85vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-brand/5 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-amber-brand"
          >
            RouteProof
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            RouteProof
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-2xl font-display text-2xl font-medium text-slate-200 sm:text-3xl"
          >
            Proof every handoff.
            <span className="text-amber-brand"> Trust every mile.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg text-slate-muted"
          >
            Decentralized proof-of-handoff and shipment custody verification on
            Stellar Soroban — giving logistics teams verifiable handoffs without
            opaque paper trails.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/app">
              <Button size="lg">
                Launch dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="secondary" size="lg">
                Verify a shipment
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-16 flex flex-wrap gap-6 border-t border-slate-700/40 pt-10"
          >
            {custodySteps.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-3 text-slate-muted"
              >
                <item.icon
                  className={`h-5 w-5 ${index < 2 ? "text-amber-brand" : "text-slate-muted"}`}
                />
                <span className={index < 2 ? "text-white" : undefined}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-700/40 bg-navy-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">
                The custody gap in modern logistics
              </h2>
              <p className="mt-4 text-slate-muted">
                Handoffs between senders, carriers, warehouses, inspectors, and
                receivers still rely on disconnected systems. Disputes stall
                because no single source of truth exists across parties.
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-white">
                RouteProof on Stellar Soroban
              </h2>
              <p className="mt-4 text-slate-muted">
                Smart contracts enforce roles, validate transitions, and store
                proof hashes for every custody event — readable on-chain,
                verifiable by anyone with a shipment ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-700/50 bg-navy-900/50 p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand/10 font-display text-lg font-bold text-amber-brand">
                  {index + 1}
                </div>
                <h3 className="font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-700/40 bg-navy-900/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">
                Built for operators, auditors, and receivers
              </h2>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-slate-muted"
                  >
                    <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-brand" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-amber-brand/20 bg-gradient-to-br from-navy-900 to-navy-950 p-8">
              <p className="font-display text-2xl font-semibold text-white">
                Ready to anchor your next shipment?
              </p>
              <p className="mt-3 text-sm text-slate-muted">
                Connect Freighter, xBull, LOBSTR, or Albedo, then manage the
                full custody lifecycle against live Testnet contracts.
              </p>
              <Link href="/app" className="mt-6 inline-block">
                <Button size="lg">Open RouteProof app</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
