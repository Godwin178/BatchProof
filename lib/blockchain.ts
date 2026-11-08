/**
 * Blockchain-related configuration and helpers.
 *
 * BatchProof never writes private business data on-chain: only the SHA-256
 * hash of a batch record is anchored through BatchProofRegistry on
 * Arbitrum Sepolia. Until a contract address is configured the platform
 * simply reports anchoring as "not configured" — it never fabricates
 * transactions or confirmations.
 */

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614
export const ARBITRUM_SEPOLIA_CHAIN_ID_HEX = '0x66eee'

export function getRegistryAddress(): string {
  return process.env.NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS ?? ''
}

export function getChainId(): number {
  const raw = process.env.NEXT_PUBLIC_CHAIN_ID
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) ? parsed : ARBITRUM_SEPOLIA_CHAIN_ID
}

export function isBlockchainConfigured(): boolean {
  return getRegistryAddress().length > 0
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export function verifyUrlFor(batchCode: string): string {
  return `${getAppUrl()}/verify/${encodeURIComponent(batchCode)}`
}

export function arbiscanTxUrl(txHash: string): string {
  return `https://sepolia.arbiscan.io/tx/${txHash}`
}

export function arbiscanAddressUrl(address: string): string {
  return `https://sepolia.arbiscan.io/address/${address}`
}
