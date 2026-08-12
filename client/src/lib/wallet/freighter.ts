import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  getNetworkDetails as freighterGetNetworkDetails,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'

/** How long we wait for the extension to answer before treating it as not installed. */
const DETECTION_TIMEOUT_MS = 1500

export const FREIGHTER_INSTALL_URL = 'https://www.freighter.app/'

export class FreighterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FreighterError'
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new FreighterError('Freighter did not respond in time.')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Detects whether the Freighter browser extension is installed and reachable.
 * `isConnected()` falls back to messaging the content script when `window.freighter`
 * isn't set yet, and that call hangs forever if no extension is listening — so
 * detection is raced against a short timeout instead of awaited directly.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await withTimeout(freighterIsConnected(), DETECTION_TIMEOUT_MS)
    return Boolean(result.isConnected) && !result.error
  } catch {
    return false
  }
}

/** Prompts the user to grant this site access and returns the selected address. */
export async function requestAccess(): Promise<string> {
  const result = await freighterRequestAccess()
  if (result.error) {
    throw new FreighterError(result.error.message)
  }
  return result.address
}

/** Returns the currently selected address without prompting, or '' if not yet granted. */
export async function getAddress(): Promise<string> {
  const result = await freighterGetAddress()
  if (result.error) {
    throw new FreighterError(result.error.message)
  }
  return result.address
}

export interface FreighterNetwork {
  network: string
  networkPassphrase: string
}

export async function getNetwork(): Promise<FreighterNetwork> {
  const result = await freighterGetNetwork()
  if (result.error) {
    throw new FreighterError(result.error.message)
  }
  return { network: result.network, networkPassphrase: result.networkPassphrase }
}

export interface FreighterNetworkDetails extends FreighterNetwork {
  networkUrl: string
  sorobanRpcUrl?: string
}

export async function getNetworkDetails(): Promise<FreighterNetworkDetails> {
  const result = await freighterGetNetworkDetails()
  if (result.error) {
    throw new FreighterError(result.error.message)
  }
  return {
    network: result.network,
    networkPassphrase: result.networkPassphrase,
    networkUrl: result.networkUrl,
    sorobanRpcUrl: result.sorobanRpcUrl,
  }
}

export interface SignTransactionOptions {
  networkPassphrase: string
  address?: string
}

/** Signs a transaction XDR via the connected Freighter wallet and returns the signed XDR. */
export async function signTransaction(transactionXdr: string, opts: SignTransactionOptions): Promise<string> {
  const result = await freighterSignTransaction(transactionXdr, opts)
  if (result.error) {
    throw new FreighterError(result.error.message)
  }
  return result.signedTxXdr
}
