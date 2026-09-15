import { describe, expect, it } from 'vitest'
import { FreighterError } from '../wallet/freighter'
import { parseContractError, SorobanError } from './errors'

describe('parseContractError', () => {
  it.each([
    ['a FreighterError from a declined signing request', new FreighterError('User declined access')],
    ['a FreighterError with any other message', new FreighterError('extension busy')],
    ['a SorobanError tagged with the sign stage', new SorobanError('sign', 'extension busy')],
  ])('maps %s to a friendly Freighter-rejected message', (_label, error) => {
    expect(parseContractError(error)).toBe('Freighter rejected the request.')
  })

  it.each([
    [
      'a submit-stage SorobanError mentioning insufficient balance',
      new SorobanError('submit', 'Transaction submission failed with status ERROR: tx_insufficient_balance.'),
    ],
    ['a plain Error with balance-insufficient wording', new Error('balance is insufficient for this operation')],
    ['a raw string mentioning an underfunded account', 'source account is underfunded'],
  ])('maps %s to a friendly insufficient-balance message', (_label, error) => {
    expect(parseContractError(error)).toBe('Insufficient balance to complete this transaction.')
  })

  it.each([
    [
      'a known medical-record-registry code (RecordAlreadyExists)',
      new SorobanError('simulation', 'HostError: Error(Contract, #1)\n\nEvent log (newest first):\n...'),
      'This medical record has already been registered.',
    ],
    [
      'a known medical-record-registry code (RecordNotFound)',
      new SorobanError('simulation', 'HostError: Error(Contract, #2)'),
      'That medical record could not be found.',
    ],
    [
      'an unrecognized contract-specific code',
      new SorobanError('simulation', 'HostError: Error(Contract, #99)'),
      'This action was rejected by the contract (code 99).',
    ],
    [
      'a built-in Auth host error (failed require_auth)',
      new SorobanError('contract', 'HostError: Error(Auth, #0)'),
      'You are not authorized to perform this action.',
    ],
    [
      'a built-in Storage host error',
      'HostError: Error(Storage, #4)',
      'The requested on-chain data could not be found.',
    ],
    [
      'a built-in Budget host error',
      new Error('HostError: Error(Budget, #7)'),
      'This transaction is too complex to process. Please try again.',
    ],
  ])('maps %s (simulation revert) to its friendly message', (_label, error, expected) => {
    expect(parseContractError(error)).toBe(expected)
  })

  it.each([
    [
      'mentioning a network passphrase mismatch',
      new SorobanError('submit', 'the network passphrase does not match the active network'),
    ],
    ['saying the wallet is on the wrong network', 'wrong network selected in Freighter'],
  ])('maps an error %s to a friendly network-mismatch message', (_label, error) => {
    expect(parseContractError(error)).toBe(
      'Your wallet is on the wrong network. Switch networks in Freighter and try again.',
    )
  })

  it.each([
    ['an unrecognized plain Error', new Error('kaboom')],
    ['a raw string with no recognizable shape', 'kaboom'],
    ['an unknown value (undefined)', undefined],
    ['an unknown value (a plain object)', { foo: 'bar' }],
    ['a SorobanError with an unrelated message', new SorobanError('poll', 'timed out waiting for confirmation')],
  ])('falls back to a generic safe message for %s', (_label, error) => {
    const message = parseContractError(error)
    expect(message).toBe('Something went wrong completing this request. Please try again.')
    expect(message).not.toMatch(/at \S+ \(.*:\d+:\d+\)/) // no stack-trace-shaped content
  })
})
