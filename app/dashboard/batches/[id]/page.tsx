import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  arbiscanTxUrl,
  isBlockchainConfigured,
  verifyUrlFor,
} from '@/lib/blockchain'
import { formatDate, formatDateTime, humanStatus, shortHash } from '@/lib/utils'
import { OWNER_STATUSES, type BatchEvent, type BatchWithProduct } from '@/lib/types'
import StatusBadge from '@/components/status-badge'
import CopyButton from '@/components/copy-button'
import AnchorButton from '@/components/anchor-button'
import { addBatchEvent } from '../../actions'

export const metadata: Metadata = {
  title: 'Batch detail',
}

const eventColors: Record<string, string> = {
  registered: 'bg-slate-400',
  distribution: 'bg-blue-500',
  inspection: 'bg-indigo-500',
  status_update: 'bg-amber-500',
}

export default async function BatchDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { created?: string; event?: string; error?: string }
}) {
  const user = await requireUser()
  const supabase = createClient()

  const { data: batchData } = await supabase
    .from('batches')
    .select('*, products (name, sku, category)')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .maybeSingle()

  const batch = (batchData as unknown as BatchWithProduct) ?? null
  if (!batch) {
    notFound()
  }

  const { data: eventsData } = await supabase
    .from('batch_events')
    .select('*')
    .eq('batch_id', batch.id)
    .order('created_at', { ascending: true })

  const events = (eventsData ?? []) as unknown as BatchEvent[]
  const verifyUrl = verifyUrlFor(batch.batch_code)
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 480, margin: 2 })
  const anchored = Boolean(batch.anchor_tx_hash)

  return (
    <div className="space-y-8">
      <header>
        <Link href="/dashboard/batches" className="text-sm text-slate-500 hover:text-slate-700">
          ← All batches
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900">
            {batch.batch_code}
          </h1>
          <StatusBadge batch={batch} />
        </div>
      </header>

      {searchParams?.created === '1' && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Batch registered. Download the QR code below and place it on your packaging.
        </p>
      )}
      {searchParams?.event === 'saved' && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Event added to the batch history.
        </p>
      )}
      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR code */}
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Verification QR code</h2>
          <p className="mt-1 text-sm text-slate-600">
            Scanning opens the public verification page for this batch.
          </p>
          <div className="mt-4 flex justify-center rounded-xl bg-white p-4 ring-1 ring-slate-200">
            {/* Generated with the `qrcode` package — a data URL, not an invented asset */}
            <img src={qrDataUrl} alt={`QR code for batch ${batch.batch_code}`} className="h-48 w-48" />
          </div>
          <p className="mt-3 break-all text-center font-mono text-xs text-slate-500">{verifyUrl}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={qrDataUrl} download={`batchproof-${batch.batch_code}.png`} className="btn-primary">
              Download QR (PNG)
            </a>
            <CopyButton value={verifyUrl} label="Copy link" />
          </div>
        </section>

        {/* Integrity & anchoring */}
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Integrity & anchoring</h2>
          <p className="mt-1 text-sm text-slate-600">
            SHA-256 fingerprint of this batch record (batch ID, producer, origin,
            dates and description).
          </p>
          <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
            {batch.data_hash}
          </p>
          <div className="mt-3">
            <CopyButton value={batch.data_hash} label="Copy fingerprint" />
          </div>
          {batch.anchor_tx_hash ? (
            <p className="mt-4 text-sm text-slate-700">
              Anchored on-chain ·{' '}
              <a
                href={arbiscanTxUrl(batch.anchor_tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-medium text-indigo-600 hover:text-indigo-500"
              >
                {shortHash(batch.anchor_tx_hash)}
              </a>{' '}
              ({formatDateTime(batch.anchored_at)} UTC)
            </p>
          ) : isBlockchainConfigured() ? (
            <div className="mt-4">
              <AnchorButton batchId={batch.id} dataHash={batch.data_hash} anchored={false} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              On-chain anchoring is not configured for this deployment. Once a registry
              contract address is set (see SETUP.md), an anchor button will appear here.
              The public verification page still shows the full batch history in the meantime.
            </p>
          )}
        </section>
      </div>

      {/* Batch details */}
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Batch record</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Product</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{batch.products?.name ?? '—'}</dd>
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
            <dd className="mt-1 text-sm text-slate-900">{formatDate(batch.production_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Expiry date</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(batch.expiry_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Registered</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(batch.created_at)}</dd>
          </div>
        </dl>
        {batch.description && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
            {batch.description}
          </p>
        )}
      </section>

      {/* Add event */}
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Add to history</h2>
        <p className="mt-1 text-sm text-slate-600">
          Log a distribution checkpoint, an inspection result, or a status change.
          Entries are visible on the public verification page.
        </p>
        <form action={addBatchEvent} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="batch_id" value={batch.id} />
          <div>
            <label htmlFor="event_type" className="label">
              Event type
            </label>
            <select id="event_type" name="event_type" required className="input" defaultValue="distribution">
              <option value="distribution">Distribution (movement / hand-off)</option>
              <option value="inspection">Inspection (quality check)</option>
              <option value="status_update">Status update</option>
            </select>
          </div>
          <div>
            <label htmlFor="location" className="label">
              Location <span className="font-normal text-slate-400">(required for distribution)</span>
            </label>
            <input id="location" name="location" maxLength={200} className="input" placeholder="Central warehouse, Rotterdam" />
          </div>
          <div>
            <label htmlFor="result" className="label">
              Inspection result <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select id="result" name="result" className="input" defaultValue="">
              <option value="">Not applicable</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label htmlFor="new_status" className="label">
              New status <span className="font-normal text-slate-400">(for status updates)</span>
            </label>
            <select id="new_status" name="new_status" className="input" defaultValue="">
              <option value="">Not applicable</option>
              {OWNER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="label">
              Notes <span className="font-normal text-slate-400">(required for status changes)</span>
            </label>
            <textarea id="notes" name="notes" rows={2} maxLength={1000} className="input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Add event
            </button>
          </div>
        </form>
      </section>

      {/* Timeline */}
      <section className="card">
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
    </div>
  )
}