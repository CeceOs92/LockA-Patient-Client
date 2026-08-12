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
