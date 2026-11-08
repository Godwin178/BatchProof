import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate, humanStatus, isBatchStatus, statusBadge } from '@/lib/utils'
import type { Batch } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Batches',
}

type BatchRow = Batch & { products: { name: string } | null }

export default async function BatchesPage({
  searchParams,
}: {
  searchParams?: { status?: string; error?: string }
}) {
  const user = await requireUser()
  const supabase = createClient()

  const status = searchParams?.status ?? ''

  let query = supabase
    .from('batches')
    .select('*, products (name)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (status && isBatchStatus(status)) {
    query = query.eq('status', status)
  }

  const { data } = await query
  const batches = (data ?? []) as unknown as BatchRow[]

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Batches</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every batch has a unique ID, a QR code and a public history.
          </p>
        </div>
        <Link href="/dashboard/batches/new" className="btn-primary">
          Register batch
        </Link>
      </header>

      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form method="get" action="/dashboard/batches" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-56">
          <label htmlFor="status" className="label">
            Filter by status
          </label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">All statuses</option>
            {['registered', 'in_distribution', 'delivered', 'recalled', 'revoked'].map((value) => (
              <option key={value} value={value}>
                {humanStatus(value)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary sm:w-auto">
          Apply
        </button>
      </form>

      {batches.length === 0 ? (
        <p className="card text-sm text-slate-600">
          {status
            ? `No batches with this status yet.`
            : 'No batches registered yet. Register your first batch to generate a QR code.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {batches.map((batch) => (
            <li key={batch.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/dashboard/batches/${batch.id}`}
                  className="font-mono font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {batch.batch_code}
                </Link>
                <span className={`badge ${statusBadge(batch)}`}>{humanStatus(batch.status)}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {batch.products?.name ?? 'Unknown product'}
              </p>
              <p className="text-sm text-slate-600">
                {batch.origin} · produced {formatDate(batch.production_date)} · expires{' '}
                {formatDate(batch.expiry_date)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {batch.anchor_tx_hash ? 'Fingerprint anchored on-chain' : 'Fingerprint not anchored'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}