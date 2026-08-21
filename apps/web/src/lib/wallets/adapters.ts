import albedo from "@albedo-link/intent";
import { xBullWalletConnect } from "@creit.tech/xbull-wallet-connect";
import {
  getPublicKey as freighterGetPublicKey,
  isAllowed,
  isConnected as freighterIsConnected,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import {
  getPublicKey as lobstrGetPublicKey,
  isConnected as lobstrIsConnected,
  signTransaction as lobstrSignTransaction,
} from "@lobstrco/signer-extension-api";
import type { WalletId } from "./types";

export interface WalletSession {
  walletId: WalletId;
  publicKey: string;
}

function albedoNetwork(passphrase: string): string {
  return passphrase.includes("Public") ? "public" : "testnet";
}

async function connectFreighter(): Promise<string> {
  const connected = await freighterIsConnected();
  if (!connected) {
    throw new Error(
      "Freighter is not installed. Install Freighter, then try again.",
    );
  }
  const allowed = await isAllowed();
  if (!allowed) {
    await setAllowed();
  }
  const address = await freighterGetPublicKey();
  if (!address) {
    throw new Error("Freighter did not return a public key.");
  }
  return address;
}

async function signFreighter(
  xdr: string,
  publicKey: string,
  networkPassphrase: string,
): Promise<string> {
  const signedXdr = await freighterSignTransaction(xdr, {
    networkPassphrase,
    accountToSign: publicKey,
  });
  if (!signedXdr) {
    throw new Error("Freighter did not return a signed transaction.");
  }
  return signedXdr;
}

async function connectXBull(): Promise<{
  publicKey: string;
  bridge: xBullWalletConnect;
}> {
  const bridge = new xBullWalletConnect({ preferredTarget: "extension" });
  try {
    const publicKey = await bridge.connect({
      canRequestPublicKey: true,
      canRequestSign: true,
    });
    if (!publicKey) {
      throw new Error("xBull did not return a public key.");
    }
    return { publicKey, bridge };
  } catch (error) {
    bridge.closeConnections();
    throw error instanceof Error
      ? error
      : new Error("xBull connection failed. Is the extension installed?");
  }
}

async function connectLobstr(): Promise<string> {
  const connected = await lobstrIsConnected();
  if (!connected) {
    throw new Error(
      "LOBSTR signer extension is not available. Install LOBSTR and enable the signer.",
    );
  }
  const address = await lobstrGetPublicKey();
  if (!address) {
    throw new Error("LOBSTR did not return a public key.");
  }
  return address;
}

async function signLobstr(xdr: string): Promise<string> {
  const signed = await lobstrSignTransaction(xdr);
  if (!signed) {
    throw new Error("LOBSTR did not return a signed transaction.");
  }
  return signed;
}

async function connectAlbedo(): Promise<string> {
  const result = await albedo.publicKey({
    token: albedo.generateRandomToken(),
  });
  if (!result?.pubkey) {
    throw new Error("Albedo did not return a public key.");
  }
  return result.pubkey;
}

async function signAlbedo(
  xdr: string,
  publicKey: string,
  networkPassphrase: string,
): Promise<string> {
  const result = await albedo.tx({
    xdr,
    pubkey: publicKey,
    network: albedoNetwork(networkPassphrase),
    submit: false,
  });
  if (!result?.signed_envelope_xdr) {
    throw new Error("Albedo did not return a signed transaction.");
  }
  return result.signed_envelope_xdr;
}

/** Holds the live xBull bridge for the session (needed for signing). */
let xbullBridge: xBullWalletConnect | null = null;

export async function connectWallet(walletId: WalletId): Promise<WalletSession> {
  switch (walletId) {
    case "freighter": {
      const publicKey = await connectFreighter();
      return { walletId, publicKey };
    }
    case "xbull": {
      xbullBridge?.closeConnections();
      const { publicKey, bridge } = await connectXBull();
      xbullBridge = bridge;
      return { walletId, publicKey };
    }
    case "lobstr": {
      const publicKey = await connectLobstr();
      return { walletId, publicKey };
    }
    case "albedo": {
      const publicKey = await connectAlbedo();
      return { walletId, publicKey };
    }
    default:
      throw new Error("Unsupported wallet.");
  }
}

export async function signWithWallet(
  walletId: WalletId,
  xdr: string,
  publicKey: string,
  networkPassphrase: string,
): Promise<string> {
  switch (walletId) {
    case "freighter":
      return signFreighter(xdr, publicKey, networkPassphrase);
    case "xbull": {
      if (!xbullBridge) {
        const session = await connectWallet("xbull");
        if (session.publicKey !== publicKey) {
          throw new Error(
            "xBull connected a different account. Reconnect and try again.",
          );
        }
      }
      const signed = await xbullBridge!.sign({
        xdr,
        publicKey,
        network: networkPassphrase,
      });
      if (!signed) {
        throw new Error("xBull did not return a signed transaction.");
      }
      return signed;
    }
    case "lobstr":
      return signLobstr(xdr);
    case "albedo":
      return signAlbedo(xdr, publicKey, networkPassphrase);
    default:
      throw new Error("Unsupported wallet.");
  }
}

export function disconnectWalletSession(walletId: WalletId | null): void {
  if (walletId === "xbull" && xbullBridge) {
    xbullBridge.closeConnections();
    xbullBridge = null;
  }
}
