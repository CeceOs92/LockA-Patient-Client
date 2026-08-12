import { FreighterError } from '../wallet/freighter'

/** Which step of the simulate → sign → submit → poll pipeline a call failed at. */
export type SorobanErrorStage = 'simulation' | 'sign' | 'submit' | 'poll' | 'contract'

export class SorobanError extends Error {
  readonly stage: SorobanErrorStage

  constructor(stage: SorobanErrorStage, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'SorobanError'
    this.stage = stage
  }
}

export function describeUnknownError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === 'string') {
    return err
  }
  return 'An unexpected error occurred talking to the Soroban RPC server.'
}

const FALLBACK_ERROR_MESSAGE = 'Something went wrong completing this request. Please try again.'

/**
 * Numeric `#[contracterror]` codes documented by locka-contracts, mapped to
 * plain-language messages. Codes are only unique *within* one contract's
 * enum, and the raw `Error(Contract, #N)` shape below doesn't identify which
 * contract raised it — so only contracts whose codes are known not to
 * collide should be added here.
 *
 * Currently sourced from `medical-record-registry`'s `RegistryError`
 * (https://github.com/LockA-Medical-Passport/LockA-Smart-Contracts) — the
 * only contract with an implemented error enum so far. Add more once other
 * contracts (patient-passport-registry, consent-access-manager, ...) ship
 * theirs.
 */
const CONTRACT_ERROR_MESSAGES: Record<number, string> = {
  1: 'This medical record has already been registered.', // RegistryError::RecordAlreadyExists
  2: 'That medical record could not be found.', // RegistryError::RecordNotFound
}

/** Matches the Rust `Display` shape of a Soroban host error, e.g. `Error(Contract, #3)`. */
const HOST_ERROR_PATTERN =
  /Error\((Contract|WasmVm|Context|Storage|Object|Crypto|Events|Budget|Value|Auth),\s*#(\d+)\)/

/** Plain-language messages for Soroban's built-in host error types (`ScErrorType`). */
const HOST_ERROR_TYPE_MESSAGES: Record<string, string> = {
  WasmVm: 'The contract ran into an internal error processing this request.',
  Context: 'This action is not valid right now.',
  Storage: 'The requested on-chain data could not be found.',
  Object: 'The contract received an unexpected value.',
  Crypto: 'A cryptographic check failed for this request.',
  Events: 'The contract could not record this action.',
  Budget: 'This transaction is too complex to process. Please try again.',
  Value: 'The contract received an invalid value.',
  Auth: 'You are not authorized to perform this action.',
}

const INSUFFICIENT_BALANCE_PATTERN = /insufficient.{0,20}balance|balance.{0,20}insufficient|underfunded/i

const NETWORK_MISMATCH_PATTERN = /network.{0,40}(mismatch|passphrase|does not match)|wrong network/i

function isSigningFailure(error: unknown): boolean {
  return error instanceof FreighterError || (error instanceof SorobanError && error.stage === 'sign')
}

/**
 * Turns a raw error from a Soroban/Freighter contract call into a
 * plain-language message safe to show a user — never a stack trace or raw
 * XDR. Pure and synchronous so it's trivial to unit test.
 */
export function parseContractError(error: unknown): string {
  if (isSigningFailure(error)) {
    return 'Freighter rejected the request.'
  }

  const message = describeUnknownError(error)

  if (INSUFFICIENT_BALANCE_PATTERN.test(message)) {
    return 'Insufficient balance to complete this transaction.'
  }

  const hostErrorMatch = message.match(HOST_ERROR_PATTERN)
  if (hostErrorMatch) {
    const [, type, codeText] = hostErrorMatch
    const code = Number(codeText)
    if (type === 'Contract') {
      return CONTRACT_ERROR_MESSAGES[code] ?? `This action was rejected by the contract (code ${code}).`
    }
    return HOST_ERROR_TYPE_MESSAGES[type] ?? FALLBACK_ERROR_MESSAGE
  }

  if (NETWORK_MISMATCH_PATTERN.test(message)) {
    return 'Your wallet is on the wrong network. Switch networks in Freighter and try again.'
  }

  return FALLBACK_ERROR_MESSAGE
}
