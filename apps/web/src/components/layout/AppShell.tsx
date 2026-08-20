"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ConnectWalletButton = dynamic(
  () =>
    import("@/features/wallet/ConnectWalletButton").then(
      (m) => m.ConnectWalletButton,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-800/80" />
    ),
  },
);
const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/shipments", label: "Shipments", icon: Package },
  { href: "/app/organizations", label: "Organizations", icon: Building2 },
  { href: "/app/inspections", label: "Inspections", icon: ClipboardCheck },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/app");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-brand/15">
            <ShieldCheck className="h-5 w-5 text-amber-brand" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            RouteProof
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {(isApp ? navItems : [{ href: "/verify", label: "Verify", icon: ShieldCheck }, { href: "/app", label: "App", icon: LayoutDashboard }]).map(
            (item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-amber-brand/10 text-amber-brand"
                      : "text-slate-muted hover:bg-navy-800/60 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            },
          )}
        </nav>
        <ConnectWalletButton size="sm" />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-700/40 bg-navy-950/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            RouteProof
          </p>
          <p className="mt-1 text-sm text-slate-muted">
            Decentralized proof-of-handoff on Stellar Soroban.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-slate-muted">
          <Link href="/verify" className="hover:text-amber-brand">
            Public verify
          </Link>
          <Link href="/app" className="hover:text-amber-brand">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-amber-brand/10 text-amber-brand"
                      : "text-slate-muted hover:bg-navy-800/60 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
