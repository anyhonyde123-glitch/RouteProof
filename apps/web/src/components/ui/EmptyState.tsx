import Link from "next/link";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-navy-900/40 px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
        <Inbox className="h-7 w-7 text-slate-muted" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      ) : actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="h-7 w-7 text-red-300" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function ConfigErrorState({ message }: { message: string }) {
  return (
    <ErrorState
      title="Contracts not configured"
      description={message}
    />
  );
}
