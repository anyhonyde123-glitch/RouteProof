import {
  Account,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Networks,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import {
  CONFIG_ERROR_MESSAGE,
  getContractEnv,
  NULL_ACCOUNT,
} from "./constants";
import { ConfigurationError, wrapSorobanError } from "./errors";

export function getNetworkPassphrase(): string {
  const env = getContractEnv();
  if (env?.network === "mainnet") return Networks.PUBLIC;
  return Networks.TESTNET;
}

export function getRpcServer(): rpc.Server {
  const env = getContractEnv();
  if (!env) {
    throw new ConfigurationError(CONFIG_ERROR_MESSAGE);
  }
  return new rpc.Server(env.sorobanRpcUrl, {
    allowHttp: env.sorobanRpcUrl.startsWith("http://"),
  });
}

export function requireContractEnv() {
  const env = getContractEnv();
  if (!env) {
    throw new ConfigurationError(CONFIG_ERROR_MESSAGE);
  }
  return env;
}

function toScVal(value: unknown): xdr.ScVal {
  return nativeToScVal(value);
}

export function fromScVal<T>(value: xdr.ScVal): T {
  return scValToNative(value) as T;
}

export async function simulateContract<T>(
  contractId: string,
  method: string,
  args: unknown[] = [],
): Promise<T> {
  const server = getRpcServer();
  const contract = new Contract(contractId);
  const account = new Account(NULL_ACCOUNT, "0");

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args.map(toScVal)))
    .setTimeout(30)
    .build();

  try {
    const simulated = await server.simulateTransaction(transaction);
    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(simulated.error ?? "Simulation failed");
    }
    if (!simulated.result?.retval) {
      throw new Error("Simulation returned no value");
    }
    return fromScVal<T>(simulated.result.retval);
  } catch (error) {
    throw wrapSorobanError(error);
  }
}

export async function invokeContract(
  contractId: string,
  method: string,
  args: unknown[],
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<unknown> {
  const server = getRpcServer();
  const contract = new Contract(contractId);
  const account = await server.getAccount(publicKey);

  let transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args.map(toScVal)))
    .setTimeout(30)
    .build();

  try {
    transaction = await server.prepareTransaction(transaction);
    const signedXdr = await signTransaction(transaction.toXDR());
    const signed = TransactionBuilder.fromXDR(
      signedXdr,
      getNetworkPassphrase(),
    );
    const response = await server.sendTransaction(signed);

    if (response.status === "PENDING") {
      let txResponse = await server.getTransaction(response.hash);
      while (txResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponse = await server.getTransaction(response.hash);
      }

      if (txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        throw new Error(
          txResponse.status === rpc.Api.GetTransactionStatus.FAILED
            ? "Transaction failed on chain"
            : "Transaction did not succeed",
        );
      }

      return txResponse.returnValue
        ? fromScVal(txResponse.returnValue)
        : null;
    }

    if (response.status === "ERROR") {
      throw new Error(response.errorResult?.toXDR("base64") ?? "Send failed");
    }

    return null;
  } catch (error) {
    throw wrapSorobanError(error);
  }
}

export async function pollTransaction(hash: string) {
  const server = getRpcServer();
  let txResponse = await server.getTransaction(hash);
  while (txResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    txResponse = await server.getTransaction(hash);
  }
  return txResponse;
}
