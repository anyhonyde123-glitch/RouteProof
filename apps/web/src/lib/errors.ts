export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class SorobanContractError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "SorobanContractError";
    this.code = code;
  }
}

const CONTRACT_ERROR_MAP: Record<number, string> = {
  1: "The protocol has not been initialized yet.",
  2: "This contract is already initialized.",
  3: "You are not authorized to perform this action.",
  4: "Shipment not found on chain.",
  5: "Invalid status transition for this shipment.",
  6: "Account is not a participant in this shipment.",
  7: "Shipment status does not allow this action.",
  8: "Handoff record not found.",
  9: "Organization not found in the registry.",
  10: "Organization already registered.",
  11: "Missing required organization role.",
  12: "Invalid handoff stage.",
  13: "Handoff parties do not match the shipment route.",
  14: "A handoff for this stage was already recorded.",
  15: "Inspection record not found.",
  16: "Inspection already approved for this shipment.",
  17: "Settlement already completed.",
  18: "Invalid sender organization.",
  19: "Invalid carrier organization.",
  20: "Invalid warehouse organization.",
  21: "Invalid inspector organization.",
  22: "Invalid receiver organization.",
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
    pattern: /missing role/i,
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
    raw.match(/contract error #(\d+)/i) ??
    raw.match(/error\s*[:=]?\s*(\d+)/i) ??
    raw.match(/#(\d+)/);
  if (!match) return undefined;
  const code = Number(match[1]);
  return Number.isFinite(code) ? code : undefined;
}

export function humanizeSorobanError(error: unknown): string {
  if (error instanceof ConfigurationError) {
    return error.message;
  }

  if (error instanceof SorobanContractError) {
    if (error.code && CONTRACT_ERROR_MAP[error.code]) {
      return CONTRACT_ERROR_MAP[error.code];
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
  if (code && CONTRACT_ERROR_MAP[code]) {
    return CONTRACT_ERROR_MAP[code];
  }

  for (const { pattern, message } of MESSAGE_PATTERNS) {
    if (pattern.test(raw)) return message;
  }

  if (raw.length > 160) {
    return "The on-chain operation failed. Verify wallet, roles, and shipment state.";
  }

  return raw;
}

export function wrapSorobanError(error: unknown): SorobanContractError {
  const message = humanizeSorobanError(error);
  const raw = error instanceof Error ? error.message : String(error);
  const code = extractContractCode(raw);
  return new SorobanContractError(message, code);
}
