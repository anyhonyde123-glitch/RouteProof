"use client";

import { useCallback, useState } from "react";
import {
  createShipment,
  markInTransit,
  recordHandoff,
  settleShipment,
  submitInspection,
} from "@/lib/contracts";
import type {
  CreateShipmentInput,
  RecordHandoffInput,
  SubmitInspectionInput,
} from "@/lib/types";
import { humanizeSorobanError } from "@/lib/errors";
import { useToast } from "./useToast";
import { useWallet } from "./useWallet";

export function useShipmentActions() {
  const { publicKey, signTransaction, connect } = useWallet();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const ensureWallet = useCallback(async () => {
    if (publicKey) return publicKey;
    const address = await connect();
    if (!address) {
      throw new Error("Connect Freighter to continue.");
    }
    return address;
  }, [connect, publicKey]);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, successMessage: string) => {
      setLoading(true);
      try {
        const result = await action();
        toast.success(successMessage);
        return result;
      } catch (error) {
        toast.error("Action failed", humanizeSorobanError(error));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return {
    loading,
    create: (input: CreateShipmentInput) =>
      run(async () => {
        const wallet = await ensureWallet();
        return createShipment(input, wallet, signTransaction);
      }, "Shipment created on chain"),
    markInTransit: (shipmentId: number) =>
      run(async () => {
        const wallet = await ensureWallet();
        await markInTransit(shipmentId, wallet, signTransaction);
      }, "Shipment marked in transit"),
    recordHandoff: (input: RecordHandoffInput) =>
      run(async () => {
        const wallet = await ensureWallet();
        return recordHandoff(input, wallet, signTransaction);
      }, "Handoff recorded on chain"),
    submitInspection: (input: SubmitInspectionInput) =>
      run(async () => {
        const wallet = await ensureWallet();
        return submitInspection(input, wallet, signTransaction);
      }, "Inspection submitted on chain"),
    settle: (shipmentId: number) =>
      run(async () => {
        const wallet = await ensureWallet();
        await settleShipment(shipmentId, wallet, signTransaction);
      }, "Settlement completed on chain"),
  };
}
