import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { arbiscanAddressUrl, getRegistryAddress, isBlockchainConfigured } from '@/lib/blockchain'
import { formatDateTime, humanStatus, shortHash } from '@/lib/utils'
import type { Batch, EventWithBatch } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Dashboard',
}

type OwnBatch = Pick<
  Batch,
  'id' | 'batch_code' | 'status' | 'anchor_tx_hash' | 'created_at'
>

export default async function DashboardPage() {
  const user = await requireUser()
  const supabase = createClient()

  const [productsResult, batchesResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase
      .from('batches')
      .select('id, batch_code, status, anchor_tx_hash, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const productCount = productsResult.count ?? 0
  const ownBatches = (batchesResult.data ?? []) as unknown as OwnBatch[]
  const ownBatchIds = ownBatches.map((batch) => batch.id)

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  let eventsLast30Days = 0
  let recentEvents: EventWithBatch[] = []

  if (ownBatchIds.length > 0) {
    const [countResult, recentResult] = await Promise.all([
      supabase
        .from('batch_events')
        .select('id', { count: 'exact', head: true })
        .in('batch_id', ownBatchIds)
        .gte('created_at', cutoff),
      supabase
        .from('batch_events')
        .select('*, batches!inner(id, batch_code)')
        .in('batch_id', ownBatchIds)
        .order('created_at', { ascending: false })
        .limit(8),
    ])
    eventsLast30Days = countResult.count ?? 0
    recentEvents = (recentResult.data ?? []) as unknown as EventWithBatch[]
  }

  const statusCounts: Record<string, number> = {}
  for (const batch of ownBatches) {
    statusCounts[batch.status] = (statusCounts[batch.status] ?? 0) + 1
  }
  const anchoredCount = ownBatches.filter((batch) => batch.anchor_tx_hash).length
  const blockchainReady = isBlockchainConfigured()

  const stats = [
    { label: 'Products registered', value: productCount },
    { label: 'Batches registered', value: ownBatches.length },
    {
      label: 'In distribution or delivered',
      value:
        (statusCounts['in_distribution'] ?? 0) + (statusCounts['delivered'] ?? 0),
    },
    { label: 'History events (30 days)', value: eventsLast30Days },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your traceability activity at a glance.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard/products" className="btn-secondary">
            Add product
          </Link>
          <Link href="/dashboard/batches/new" className="btn-primary">
            Register batch
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 sm:p-6">
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Batch status breakdown</h2>
          {ownBatches.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No batches yet.{' '}
              <Link href="/dashboard/batches/new" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register your first batch
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-4">
                  <Link
                    href={`/dashboard/batches?status=${status}`}
                    className="text-sm font-medium capitalize text-slate-700 hover:text-indigo-600"
                  >
                    {humanStatus(status)}
                  </Link>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <span className="text-sm font-medium text-slate-700">Fingerprints anchored</span>
                <span className="text-sm font-semibold text-slate-900">
                  {anchoredCount} of {ownBatches.length}
                </span>
              </li>
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Blockchain anchoring</h2>
          {blockchainReady ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Anchoring is configured. Anchor a batch from its detail page after
                connecting a wallet.
              </p>
              <p className="mt-3 break-all font-mono text-xs text-slate-600">
                Registry: {getRegistryAddress()}
              </p>
              <a
                href={arbiscanAddressUrl(getRegistryAddress())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View registry on Arbiscan →
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              On-chain anchoring is not configured, so nothing is being written to any
              network. To enable it, deploy <span className="font-mono text-xs">BatchProofRegistry</span> to
              Arbitrum Sepolia and set{' '}
              <span className="font-mono text-xs">NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS</span> —
              full instructions in SETUP.md. Only SHA-256 fingerprints are ever sent on-chain.
            </p>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        {recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No history events recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {recentEvents.map((event) => (
              <li key={event.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {humanStatus(event.event_type)}
                    {event.result ? ` — ${event.result}` : ''}
                    {event.status ? ` → ${humanStatus(event.status)}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event.location ? `${event.location} · ` : ''}
                    {formatDateTime(event.created_at)} UTC
                  </p>
                </div>
                <Link
                  href={`/dashboard/batches/${event.batches?.id ?? ''}`}
                  className="font-mono text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {event.batches?.batch_code ?? ''}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ownBatches.length > 0 && (
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Latest batches</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {ownBatches.slice(0, 5).map((batch) => (
              <li key={batch.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/dashboard/batches/${batch.id}`}
                  className="font-mono text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {batch.batch_code}
                </Link>
                <p className="text-xs text-slate-500">
                  {batch.anchor_tx_hash
                    ? `anchored · ${shortHash(batch.anchor_tx_hash)}`
                    : 'not anchored'}
                  {' · '}
                  {formatDateTime(batch.created_at)} UTC
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}