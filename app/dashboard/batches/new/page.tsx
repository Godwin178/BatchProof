import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createBatch } from '../../actions'

export const metadata: Metadata = {
  title: 'Register a batch',
}

export default async function NewBatchPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const supabase = createClient()

  const { data } = await supabase
    .from('products')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('name')

  const products = (data ?? []) as unknown as { id: string; name: string }[]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register a batch</h1>
        <p className="mt-1 text-sm text-slate-600">
          The record below is what customers see when they scan the batch QR code.
          Its SHA-256 fingerprint can later be anchored on-chain.
        </p>
      </header>

      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="card">
        <form action={createBatch} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product_id" className="label">
              Product
            </label>
            <select id="product_id" name="product_id" required className="input" defaultValue="">
              <option value="" disabled>
                Choose one of your products…
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="mt-2 text-sm text-slate-600">
                You need a product first.{' '}
                <Link href="/dashboard/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Add one here
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <label htmlFor="batch_code" className="label">
              Batch ID
            </label>
            <input
              id="batch_code"
              name="batch_code"
              required
              maxLength={64}
              pattern="[A-Za-z0-9_-]{4,64}"
              className="input"
              placeholder="BATCH-2025-0001"
            />
            <p className="mt-1 text-xs text-slate-500">
              4–64 characters: letters, numbers, hyphens or underscores. Must be unique.
            </p>
          </div>

          <div>
            <label htmlFor="producer_name" className="label">
              Producer
            </label>
            <input
              id="producer_name"
              name="producer_name"
              required
              maxLength={120}
              className="input"
              defaultValue={profile?.business_name ?? ''}
              placeholder="Acme Organic Foods"
            />
          </div>

          <div>
            <label htmlFor="origin" className="label">
              Origin
            </label>
            <input
              id="origin"
              name="origin"
              required
              maxLength={200}
              className="input"
              placeholder="Estate, region, country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="production_date" className="label">
                Production date
              </label>
              <input id="production_date" name="production_date" type="date" required className="input" />
            </div>
            <div>
              <label htmlFor="expiry_date" className="label">
                Expiry date
              </label>
              <input id="expiry_date" name="expiry_date" type="date" required className="input" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">
              Description <span className="font-normal text-slate-400">(optional, shown on the public page)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={2000}
              className="input"
              placeholder="What makes this production run notable? Harvest notes, certifications…"
            />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={products.length === 0}>
              Register batch
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}