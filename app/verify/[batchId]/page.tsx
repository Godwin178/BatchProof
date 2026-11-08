import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { arbiscanTxUrl } from '@/lib/blockchain'
import { displayStatus, formatDateTime, humanStatus, shortHash, statusBadgeClass } from '@/lib/utils'
import type { BatchEvent, BatchWithProduct } from '@/lib/types'
import { submitReport } from './actions'

export const metadata: Metadata = {
  title: 'Batch verification',
}

const REASONS = [
  { value: 'counterfeit_suspected', label: 'I suspect this is counterfeit' },
  { value: 'label_mismatch', label: 'Label or product does not match' },
  { value: 'expired_product', label: 'Product appears expired' },
  { value: 'broken_packaging', label: 'Packaging was broken or tampered with' },
  { value: 'other', label: 'Other issue' },
]

const eventColors: Record<string, string> = {
  registered: 'bg-slate-400',
  distribution: 'bg-blue-500',
  inspection: 'bg-indigo-500',
  status_update: 'bg-amber-500',
}

export default async function VerifyBatchPage({
  params,
  searchParams,
}: {
  params: { batchId: string }
  searchParams?: { reported?: string; error?: string }
}) {
  const code = decodeURIComponent(params.batchId).trim()
  const supabase = createClient()

  const { data } = await supabase
    .from('batches')
    .select('*, products (name, sku, category)')
    .eq('batch_code', code)
    .maybeSingle()

  const batch = (data as unknown as BatchWithProduct) ?? null

  if (!batch) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <div className="card text-center">
          <span className="badge bg-red-100 text-red-700">Not found</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            No batch record found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            No batch with ID <span className="font-mono font-semibold">{code}</span> is
            registered on BatchProof. Check the ID for typos, or contact the seller
            before trusting the product.
          </p>
          <Link href="/verify" className="btn-secondary mt-6">
            Try another batch ID
          </Link>
        </div>
      </div>
    )
  }

  const { data: eventsData } = await supabase
    .from('batch_events')
    .select('*')
    .eq('batch_id', batch.id)
    .order('created_at', { ascending: true })

  const events = (eventsData ?? []) as unknown as BatchEvent[]
  const status = displayStatus(batch)
  const compromised = batch.status === 'revoked' || batch.status === 'recalled'
  const expired = status === 'expired'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      {/* Verdict banner */}
      <div
        className={`rounded-2xl border p-6 ${
          compromised
            ? 'border-red-200 bg-red-50'
            : expired
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        <span className={`badge ${statusBadgeClass[status] ?? 'bg-slate-100 text-slate-700'}`}>
          {humanStatus(status)}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          {compromised
            ? 'This batch has been withdrawn from circulation'
            : 'Batch record verified'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {compromised
            ? 'The producer or a platform administrator has marked this batch as ' +
              humanStatus(batch.status) +
              '. Do not distribute or consume products from it.'
            : expired
              ? 'This batch record exists, but its registered expiry date has passed.'
              : 'This batch ID is registered on BatchProof. Details below come from the producer’s own records.'}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Batch ID <span className="font-mono font-semibold">{batch.batch_code}</span>
        </p>
      </div>

      {searchParams?.reported === '1' && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Thank you — your report was submitted for review.
        </p>
      )}
      {searchParams?.error && (
        <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {searchParams.error}
        </p>
      )}

      {/* Batch details */}
      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Batch details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Product</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{batch.products?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">SKU</dt>
            <dd className="mt-1 font-mono text-sm text-slate-900">{batch.products?.sku ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Producer</dt>
            <dd className="mt-1 text-sm text-slate-900">{batch.producer_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Origin</dt>
            <dd className="mt-1 text-sm text-slate-900">{batch.origin}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Production date</dt>
            <dd className="mt-1 text-sm text-slate-900">{batch.production_date}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Expiry date</dt>
            <dd className="mt-1 text-sm text-slate-900">{batch.expiry_date}</dd>
          </div>
        </dl>
        {batch.description && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
            {batch.description}
          </p>
        )}
      </section>

      {/* Integrity */}
      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Record integrity</h2>
        <p className="mt-1 text-sm text-slate-600">
          The producer committed a SHA-256 fingerprint of this batch record. The
          fingerprint — never the record itself — may be anchored on the Arbitrum
          Sepolia test network.
        </p>
        <p className="mt-4 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
          sha256: {batch.data_hash}
        </p>
        {batch.anchor_tx_hash ? (
          <p className="mt-3 text-sm text-slate-700">
            Anchored on-chain — recorded transaction{' '}
            <a
              href={arbiscanTxUrl(batch.anchor_tx_hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-medium text-indigo-600 hover:text-indigo-500"
            >
              {shortHash(batch.anchor_tx_hash)}
            </a>{' '}
            ({formatDateTime(batch.anchored_at)} UTC, view on Arbiscan).
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            This fingerprint has not been anchored on-chain yet.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">Registered {formatDateTime(batch.created_at)} UTC</p>
      </section>

      {/* History */}
      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Batch history</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No events recorded yet.</p>
        ) : (
          <ol className="mt-4 space-y-0">
            {events.map((event, index) => (
              <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < events.length - 1 && (
                  <span
                    className="absolute left-[5px] top-4 h-full w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${
                    eventColors[event.event_type] ?? 'bg-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {humanStatus(event.event_type)}
                    {event.result && (
                      <span className={event.result === 'passed' ? 'text-emerald-600' : 'text-red-600'}>
                        {' '}— {event.result}
                      </span>
                    )}
                    {event.status && <span className="text-slate-500"> → {humanStatus(event.status)}</span>}
                  </p>
                  {event.location && <p className="text-sm text-slate-600">{event.location}</p>}
                  {event.notes && <p className="text-sm text-slate-600">{event.notes}</p>}
                  <p className="text-xs text-slate-400">{formatDateTime(event.created_at)} UTC</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Report */}
      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Report a problem</h2>
        <p className="mt-1 text-sm text-slate-600">
          Spotted something wrong with this batch? Reports are reviewed by the
          platform team.
        </p>
        <form action={submitReport} className="mt-4 space-y-4">
          <input type="hidden" name="batch_code" value={batch.batch_code} />
          <div>
            <label htmlFor="reason" className="label">
              Reason
            </label>
            <select id="reason" name="reason" required className="input" defaultValue="">
              <option value="" disabled>
                Choose a reason…
              </option>
              {REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="details" className="label">
              Details <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="details"
              name="details"
              rows={3}
              maxLength={2000}
              className="input"
              placeholder="What did you notice?"
            />
          </div>
          <div>
            <label htmlFor="reporter_contact" className="label">
              Your email <span className="font-normal text-slate-400">(optional, for follow-up)</span>
            </label>
            <input
              id="reporter_contact"
              name="reporter_contact"
              type="email"
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="btn-primary">
            Submit report
          </button>
        </form>
      </section>
    </div>
  )
}