import {
  Account,
  BASE_FEE,
  Contract,
  StrKey,
  TransactionBuilder,
  rpc,
  scValToNative,
  type Transaction,
  type xdr,
} from '@stellar/stellar-sdk'
import { getAddress, signTransaction as signWithFreighter } from '../wallet/freighter'
import { describeUnknownError, SorobanError } from './errors'

/** How long to wait on a single RPC request before giving up. */
const RPC_TIMEOUT_MS = 10_000
/** How many times to poll for a submitted transaction's result before giving up. */
const POLL_ATTEMPTS = 10
/** Seconds a built transaction remains valid for submission. */
const TRANSACTION_TIMEOUT_SECONDS = 30

/**
 * Placeholder source account (the all-zero StrKey) used to build read-only
 * simulation transactions. Simulation doesn't require the source account to
 * exist on-chain, so reads work without a connected wallet.
 */
const SIMULATION_ACCOUNT_ID = StrKey.encodeEd25519PublicKey(new Uint8Array(32))

export interface ContractCallParams {
  contractId: string
  method: string
  /** Positional call arguments, already converted to ScVal — see `nativeToScVal`. */
  args?: xdr.ScVal[]
}

function getEnv() {
  return {
    rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL,
    networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE,
  }
}

function getServer(rpcUrl: string): rpc.Server {
  return new rpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http://'), timeout: RPC_TIMEOUT_MS })
}

function buildTransaction(
  sourceAccount: Account,
  networkPassphrase: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Transaction {
  const operation = new Contract(contractId).call(method, ...args)
  return new TransactionBuilder(sourceAccount, { fee: BASE_FEE, networkPassphrase })
    .addOperation(operation)
    .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
    .build()
}

/**
 * Simulates a contract call and returns its decoded result. Read-only — never
 * signs or submits, so it works without a connected wallet.
 */
export async function readContract<T = unknown>({ contractId, method, args = [] }: ContractCallParams): Promise<T> {
  const { rpcUrl, networkPassphrase } = getEnv()
  const server = getServer(rpcUrl)
  const sourceAccount = new Account(SIMULATION_ACCOUNT_ID, '0')
  const transaction = buildTransaction(sourceAccount, networkPassphrase, contractId, method, args)

  let simulation: rpc.Api.SimulateTransactionResponse
  try {
    simulation = await server.simulateTransaction(transaction)
  } catch (err) {
    throw new SorobanError('simulation', `Could not simulate '${method}': ${describeUnknownError(err)}`, {
      cause: err,
    })
  }

  if (rpc.Api.isSimulationError(simulation)) {
    throw new SorobanError('simulation', simulation.error)
  }
  if (!simulation.result) {
    throw new SorobanError('simulation', `'${method}' on ${contractId} returned no result.`)
  }

  return scValToNative(simulation.result.retval) as T
}

/**
 * Simulates, signs (via the connected Freighter wallet), submits, and polls
 * for the result of a contract call that mutates state.
 */
export async function invokeContract<T = unknown>({ contractId, method, args = [] }: ContractCallParams): Promise<T> {
  const { rpcUrl, networkPassphrase } = getEnv()
  const server = getServer(rpcUrl)

  const sourceAddress = await getAddress()
  if (!sourceAddress) {
    throw new SorobanError('simulation', 'Connect a wallet before invoking a contract method.')
  }

  let sourceAccount: Account
  try {
    sourceAccount = await server.getAccount(sourceAddress)
  } catch (err) {
    throw new SorobanError('simulation', `Could not load account ${sourceAddress}: ${describeUnknownError(err)}`, {
      cause: err,
    })
  }

  const transaction = buildTransaction(sourceAccount, networkPassphrase, contractId, method, args)

  let prepared: Transaction
  try {
    prepared = await server.prepareTransaction(transaction)
  } catch (err) {
    throw new SorobanError('simulation', `Could not simulate '${method}': ${describeUnknownError(err)}`, {
      cause: err,
    })
  }

  let signedXdr: string
  try {
    signedXdr = await signWithFreighter(prepared.toXDR(), { networkPassphrase, address: sourceAddress })
  } catch (err) {
    throw new SorobanError('sign', describeUnknownError(err), { cause: err })
  }

  const signedTransaction = TransactionBuilder.fromXDR(signedXdr, networkPassphrase) as Transaction

  let sendResult: rpc.Api.SendTransactionResponse
  try {
    sendResult = await server.sendTransaction(signedTransaction)
  } catch (err) {
    throw new SorobanError('submit', `Could not submit '${method}': ${describeUnknownError(err)}`, { cause: err })
  }

  if (sendResult.status !== 'PENDING') {
    throw new SorobanError('submit', `Transaction submission failed with status ${sendResult.status}.`, {
      cause: sendResult,
    })
  }

  let finalResult: rpc.Api.GetTransactionResponse
  try {
    finalResult = await server.pollTransaction(sendResult.hash, { attempts: POLL_ATTEMPTS })
  } catch (err) {
    throw new SorobanError('poll', `Could not confirm '${method}': ${describeUnknownError(err)}`, { cause: err })
  }

  if (finalResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new SorobanError('contract', `'${method}' on ${contractId} failed on-chain.`, { cause: finalResult })
  }
  if (finalResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new SorobanError(
      'poll',
      `Timed out waiting to confirm '${method}' (tx ${sendResult.hash}). It may still complete.`,
    )
  }

  if (!finalResult.returnValue) {
    return undefined as T
  }
  return scValToNative(finalResult.returnValue) as T
}
