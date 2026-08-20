import { describe, expect, it } from "vitest";
import {
  getContractEnv,
  HANDOFF_STAGE,
  isContractsConfigured,
  ROLE,
  SHIPMENT_STATUS,
  STATUS_LABELS,
} from "@/lib/constants";

describe("constants", () => {
  it("maps shipment statuses 1-9", () => {
    expect(SHIPMENT_STATUS.Created).toBe(1);
    expect(SHIPMENT_STATUS.Completed).toBe(9);
    expect(STATUS_LABELS[SHIPMENT_STATUS.InTransit]).toBe("In Transit");
  });

  it("uses bitwise role flags", () => {
    expect(ROLE.Sender).toBe(1);
    expect(ROLE.Carrier).toBe(2);
    expect(ROLE.Warehouse).toBe(4);
    expect(ROLE.Inspector).toBe(8);
    expect(ROLE.Receiver).toBe(16);
    expect(ROLE.Sender | ROLE.Carrier).toBe(3);
  });

  it("defines five handoff stages", () => {
    expect(HANDOFF_STAGE.Pickup).toBe(1);
    expect(HANDOFF_STAGE.ToReceiver).toBe(5);
  });

  it("reports unconfigured env when contract IDs missing", () => {
    expect(isContractsConfigured()).toBe(false);
    expect(getContractEnv()).toBeNull();
  });
});
