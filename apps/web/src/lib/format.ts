import {
  ROLE,
  ROLE_LABELS,
  SHIPMENT_STATUS,
  STAGE_LABELS,
  STATUS_LABELS,
} from "./constants";

export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`;
}

export function formatStatus(status: number): string {
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export function formatStage(stage: number): string {
  return STAGE_LABELS[stage] ?? `Stage ${stage}`;
}

export function formatRoles(roles: number): string[] {
  const labels: string[] = [];
  for (const [flag, label] of Object.entries(ROLE_LABELS)) {
    const value = Number(flag);
    if (roles & value) labels.push(label);
  }
  return labels;
}

export function formatRoleFlags(flags: number[]): number {
  return flags.reduce((acc, flag) => acc | flag, 0);
}

export function formatTimestamp(seconds: number): string {
  if (!seconds) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

export function formatRelativeTime(seconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - seconds));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function statusBadgeVariant(
  status: number,
): "default" | "warning" | "success" | "info" {
  if (status === SHIPMENT_STATUS.Completed) return "success";
  if (
    status === SHIPMENT_STATUS.InspectionPending ||
    status === SHIPMENT_STATUS.Created
  )
    return "warning";
  if (
    status === SHIPMENT_STATUS.Delivered ||
    status === SHIPMENT_STATUS.Inspected
  )
    return "info";
  return "default";
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function roleOptions() {
  return Object.entries(ROLE).map(([key, value]) => ({
    key,
    value: value as number,
    label: ROLE_LABELS[value],
  }));
}

export function hashPreview(hash: string, length = 12): string {
  if (!hash) return "—";
  if (hash.length <= length) return hash;
  return `${hash.slice(0, length)}…`;
}
