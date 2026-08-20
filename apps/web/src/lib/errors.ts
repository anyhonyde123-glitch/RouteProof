export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class SorobanContractError extends Error {
  code?: number;
  source?: ContractErrorSource;

  constructor(message: string, code?: number, source?: ContractErrorSource) {
    super(message);
    this.name = "SorobanContractError";
    this.code = code;
    this.source = source;
  }
}

export type ContractErrorSource =
  | "registry"
  | "shipment"
  | "factory"
  | "handoff"
  | "inspection"
  | "settlement";

const SHARED_ERROR_MAP: Record<number, string> = {
  1: "The protocol has not been initialized yet.",
  2: "This contract is already initialized.",
};

const CONTRACT_ERROR_MAPS: Record<
  ContractErrorSource,
  Record<number, string>
> = {
  registry: {
    ...SHARED_ERROR_MAP,
    3: "Organization not found in the registry.",
    4: "Organization already registered.",
    5: "The account is missing a required organization role.",
    6: "Organization is inactive.",
    7: "You are not authorized to perform this action.",
  },
  shipment: {
    ...SHARED_ERROR_MAP,
    3: "You are not authorized to perform this action.",
    4: "Shipment not found on chain.",
    5: "This status change is not allowed for the current shipment state.",
    6: "Account is not a participant in this shipment.",
    7: "Shipment status does not allow this action.",
  },
  factory: {
    ...SHARED_ERROR_MAP,
    3: "You are not authorized to perform this action.",
    4: "Sender organization is missing the sender role.",
    5: "Carrier organization is missing the carrier role.",
    6: "Warehouse organization is missing the warehouse role.",
    7: "Inspector organization is missing the inspector role.",
    8: "Receiver organization is missing the receiver role.",
  },
  handoff: {
    ...SHARED_ERROR_MAP,
    3: "You are not authorized to perform this action.",
    4: "Invalid handoff stage.",
    5: "Handoff parties do not match the shipment route.",
    6: "Shipment status does not allow this action.",
    7: "A handoff for this stage was already recorded.",
    8: "Handoff record not found.",
  },
  inspection: {
    ...SHARED_ERROR_MAP,
    3: "You are not authorized to perform this action.",
    4: "Shipment status does not allow this action.",
    5: "Inspection already approved for this shipment.",
    6: "No inspection record exists for this shipment.",
  },
  settlement: {
    ...SHARED_ERROR_MAP,
    3: "You are not authorized to perform this action.",
    4: "Shipment status does not allow this action.",
    5: "Settlement was already completed for this shipment.",
  },
};

const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /not initialized/i,
    message: "Contracts are not initialized on this network.",
  },
  {
    pattern: /unauthorized/i,
    message: "Your wallet is not authorized for this action.",
  },
  {
    pattern: /shipment not found/i,
    message: "Shipment not found on chain.",
  },
  {
    pattern: /invalid transition/i,
    message: "This status change is not allowed for the current shipment state.",
  },
  {
    pattern: /duplicate handoff/i,
    message: "A handoff for this stage was already recorded.",
  },
  {
    pattern: /org already exists/i,
    message: "This organization is already registered.",
  },
  {
    pattern: /missing role|invalid (sender|carrier|warehouse|inspector|receiver)/i,
    message: "The account is missing a required organization role.",
  },
  {
    pattern: /invalid status/i,
    message: "Shipment status does not allow this action.",
  },
  {
    pattern: /inspection not found/i,
    message: "No inspection record exists for this shipment.",
  },
  {
    pattern: /already completed/i,
    message: "Settlement was already completed for this shipment.",
  },
  {
    pattern: /host function failed/i,
    message: "The on-chain call was rejected. Check roles, status, and participants.",
  },
  {
    pattern: /simulation failed/i,
    message: "Unable to simulate this contract call on Soroban.",
  },
];

function extractContractCode(raw: string): number | undefined {
  const match =
    raw.match(/Error\(Contract,\s*#(\d+)\)/i) ??
    raw.match(/contract error #(\d+)/i) ??
    raw.match(/error\s*[:=]?\s*(\d+)/i);
  if (!match) return undefined;
  const code = Number(match[1]);
  return Number.isFinite(code) ? code : undefined;
}

function mapContractError(
  code: number,
  source?: ContractErrorSource,
): string | undefined {
  if (source) {
    return CONTRACT_ERROR_MAPS[source][code];
  }
  return SHARED_ERROR_MAP[code];
}

export function humanizeSorobanError(
  error: unknown,
  source?: ContractErrorSource,
): string {
  if (error instanceof ConfigurationError) {
    return error.message;
  }

  if (error instanceof SorobanContractError) {
    const resolvedSource = error.source ?? source;
    if (error.code !== undefined) {
      const mapped = mapContractError(error.code, resolvedSource);
      if (mapped) return mapped;
    }
    return error.message;
  }

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected error occurred.";

  const code = extractContractCode(raw);
  if (code !== undefined) {
    const mapped = mapContractError(code, source);
    if (mapped) return mapped;
  }

  for (const { pattern, message } of MESSAGE_PATTERNS) {
    if (pattern.test(raw)) return message;
  }

  if (raw.length > 160) {
    return "The on-chain operation failed. Verify wallet, roles, and shipment state.";
  }

  return raw;
}

export function wrapSorobanError(
  error: unknown,
  source?: ContractErrorSource,
): SorobanContractError {
  const raw = error instanceof Error ? error.message : String(error);
  const code = extractContractCode(raw);
  const message = humanizeSorobanError(error, source);
  return new SorobanContractError(message, code, source);
}
