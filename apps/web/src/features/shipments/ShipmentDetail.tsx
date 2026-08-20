"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { HANDOFF_STAGE, SHIPMENT_STATUS } from "@/lib/constants";
import {
  formatStage,
  formatStatus,
  formatTimestamp,
  hashPreview,
  truncateAddress,
} from "@/lib/format";
import type { HandoffRecord, Shipment } from "@/lib/types";
import { useShipmentActions } from "@/hooks/useShipmentActions";
import { useWallet } from "@/hooks/useWallet";

const iconForType = {
  status: Package,
  handoff: Handshake,
  inspection: ClipboardCheck,
  settlement: ShieldCheck,
};

export function CustodyTimeline({
  shipment,
  handoffs,
}: {
  shipment: Shipment;
  handoffs: HandoffRecord[];
}) {
  const events = [
    {
      id: "created",
      type: "status" as const,
      title: "Created",
      description: `${shipment.origin} → ${shipment.destination}`,
      timestamp: shipment.created_at,
    },
    ...handoffs.map((handoff) => ({
      id: `handoff-${handoff.id}`,
      type: "handoff" as const,
      title: formatStage(handoff.stage),
      description: `Proof ${hashPreview(handoff.proof_hash)} · ${truncateAddress(handoff.from_party)} → ${truncateAddress(handoff.to_party)}`,
      timestamp: handoff.recorded_at,
    })),
    ...(shipment.updated_at > shipment.created_at
      ? [
          {
            id: "current-status",
            type: "status" as const,
            title: formatStatus(shipment.status),
            description: "Current on-chain status",
            timestamp: shipment.updated_at,
          },
        ]
      : []),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon =
          iconForType[event.type === "handoff" ? "handoff" : "status"];
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 rounded-xl border border-slate-700/40 bg-navy-900/50 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-brand/10">
              <Icon className="h-5 w-5 text-amber-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{event.title}</p>
                <Badge variant="default">{formatTimestamp(event.timestamp)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-muted">{event.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ShipmentActionsPanel({ shipment }: { shipment: Shipment }) {
  const { publicKey } = useWallet();
  const { markInTransit, recordHandoff, submitInspection, settle, loading } =
    useShipmentActions();
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [proofHash, setProofHash] = useState("");
  const [notesHash, setNotesHash] = useState("");

  const nextStage =
    shipment.status === SHIPMENT_STATUS.Created
      ? HANDOFF_STAGE.Pickup
      : shipment.status === SHIPMENT_STATUS.InTransit
        ? HANDOFF_STAGE.TransitToWarehouse
        : shipment.status === SHIPMENT_STATUS.WarehouseReceived
          ? HANDOFF_STAGE.ToInspector
          : shipment.status === SHIPMENT_STATUS.Inspected
            ? HANDOFF_STAGE.ToDelivery
            : shipment.status === SHIPMENT_STATUS.OutForDelivery
              ? HANDOFF_STAGE.ToReceiver
              : null;

  const stageParties = (() => {
    switch (nextStage) {
      case HANDOFF_STAGE.Pickup:
        return { from: shipment.sender, to: shipment.carrier };
      case HANDOFF_STAGE.TransitToWarehouse:
        return { from: shipment.carrier, to: shipment.warehouse };
      case HANDOFF_STAGE.ToInspector:
        return { from: shipment.warehouse, to: shipment.inspector };
      case HANDOFF_STAGE.ToDelivery:
        return {
          from:
            publicKey === shipment.inspector
              ? shipment.inspector
              : shipment.warehouse,
          to: shipment.carrier,
        };
      case HANDOFF_STAGE.ToReceiver:
        return { from: shipment.carrier, to: shipment.receiver };
      default:
        return null;
    }
  })();

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
      <h3 className="font-display text-lg font-semibold text-white">
        Shipment actions
      </h3>
      <p className="mt-1 text-sm text-slate-muted">
        Actions invoke real Soroban contracts via Freighter.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {shipment.status === SHIPMENT_STATUS.PickedUp ? (
          <Button loading={loading} onClick={() => void markInTransit(shipment.id)}>
            Mark in transit
          </Button>
        ) : null}
        {nextStage && stageParties ? (
          <Button variant="secondary" onClick={() => setHandoffOpen(true)}>
            Record handoff
          </Button>
        ) : null}
        {shipment.status === SHIPMENT_STATUS.InspectionPending ? (
          <Button variant="secondary" onClick={() => setInspectionOpen(true)}>
            Submit inspection
          </Button>
        ) : null}
        {shipment.status === SHIPMENT_STATUS.Delivered ? (
          <Button loading={loading} onClick={() => void settle(shipment.id)}>
            Complete settlement
          </Button>
        ) : null}
      </div>

      <Modal
        open={handoffOpen}
        onClose={() => setHandoffOpen(false)}
        title="Record handoff"
        description={
          nextStage
            ? `${formatStage(nextStage)} · ${truncateAddress(stageParties?.from ?? "")} → ${truncateAddress(stageParties?.to ?? "")}`
            : undefined
        }
      >
        <div className="space-y-4">
          <Input
            label="Proof hash"
            value={proofHash}
            onChange={(event) => setProofHash(event.target.value)}
          />
          <Button
            loading={loading}
            onClick={() =>
              void recordHandoff({
                shipmentId: shipment.id,
                fromParty: stageParties!.from,
                toParty: stageParties!.to,
                stage: nextStage!,
                proofHash,
              }).then(() => {
                setHandoffOpen(false);
                setProofHash("");
                window.location.reload();
              })
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit handoff
          </Button>
        </div>
      </Modal>

      <Modal
        open={inspectionOpen}
        onClose={() => setInspectionOpen(false)}
        title="Submit inspection"
        description="Inspector submits pass/fail with notes hash on chain."
      >
        <div className="space-y-4">
          <Input
            label="Notes hash"
            value={notesHash}
            onChange={(event) => setNotesHash(event.target.value)}
          />
          <div className="flex gap-3">
            <Button
              loading={loading}
              onClick={() =>
                void submitInspection({
                  shipmentId: shipment.id,
                  passed: true,
                  notesHash,
                }).then(() => {
                  setInspectionOpen(false);
                  window.location.reload();
                })
              }
            >
              Pass
            </Button>
            <Button
              variant="danger"
              loading={loading}
              onClick={() =>
                void submitInspection({
                  shipmentId: shipment.id,
                  passed: false,
                  notesHash,
                }).then(() => {
                  setInspectionOpen(false);
                  window.location.reload();
                })
              }
            >
              Fail
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
