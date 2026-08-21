import { describe, expect, it } from "vitest";
import { WALLET_OPTIONS } from "@/lib/wallets/types";

describe("wallet options", () => {
  it("exposes the four rubric wallets", () => {
    expect(WALLET_OPTIONS.map((w) => w.id)).toEqual([
      "freighter",
      "xbull",
      "lobstr",
      "albedo",
    ]);
  });
});
