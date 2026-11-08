import { createHash } from 'crypto'

export interface BatchHashInput {
  batchCode: string
  producerName: string
  origin: string
  productionDate: string
  expiryDate: string
  description: string
}

/**
 * Canonical SHA-256 fingerprint of a batch record.
 *
 * The same fields are concatenated in a fixed order with a `|` separator so
 * the hash can be recomputed and compared at any time. Only this hash ever
 * leaves the platform — private business information is never placed on-chain.
 */
export function computeBatchHash(input: BatchHashInput): string {
  const payload = [
    input.batchCode,
    input.producerName,
    input.origin,
    input.productionDate,
    input.expiryDate,
    input.description,
  ].join('|')
  return createHash('sha256').update(payload, 'utf8').digest('hex')
}

/** Internal identifier used to link events to their creator. */
export function newId(): string {
  return randomUUID()
}
