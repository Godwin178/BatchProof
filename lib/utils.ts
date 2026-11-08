import type { BatchStatus } from '@/lib/types'

/** Deterministic date formatting (UTC) so server output never clashes with hydration. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function humanStatus(status: string): string {
  return status.replace(/_/g, ' ')
}

export const statusBadgeClass: Record<string, string> = {
  registered: 'bg-slate-100 text-slate-700',
  in_distribution: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  recalled: 'bg-amber-100 text-amber-800',
  expired: 'bg-orange-100 text-orange-800',
  revoked: 'bg-red-100 text-red-700',
}

/**
 * Effective status shown to the public: an untouched batch whose expiry
 * date has passed is presented as expired without rewriting stored data.
 */
export function displayStatus(batch: { status: string; expiry_date: string }): string {
  if (batch.status === 'registered' && new Date(batch.expiry_date) < new Date()) {
    return 'expired'
  }
  return batch.status
}

export function statusBadge(batch: { status: string; expiry_date: string }): string {
  return statusBadgeClass[displayStatus(batch)] ?? 'bg-slate-100 text-slate-700'
}

export function isBatchStatus(value: string): value is BatchStatus {
  return ['registered', 'in_distribution', 'delivered', 'recalled', 'revoked'].includes(value)
}

export function statusLabelForBatch(batch: { status: string; expiry_date: string }): string {
  return humanStatus(displayStatus(batch))
}

/** Truncate long hashes for display. */
export function shortHash(hash: string, visible = 10): string {
  if (hash.length <= visible * 2) return hash
  return `${hash.slice(0, visible)}…${hash.slice(-visible)}`
}
