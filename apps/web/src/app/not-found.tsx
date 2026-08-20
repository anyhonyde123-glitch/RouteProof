import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-sm uppercase tracking-widest text-amber-brand">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">
        Page not found
      </h1>
      <p className="mt-3 text-slate-muted">
        The page you requested does not exist or the shipment ID is invalid.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
