import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { createProduct, deleteProduct } from '../actions'

export const metadata: Metadata = {
  title: 'Products',
}

type ProductRow = Product & { batches: { id: string }[] | null }

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { error?: string; saved?: string }
}) {
  const user = await requireUser()
  const supabase = createClient()

  const { data } = await supabase
    .from('products')
    .select('*, batches (id)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const products = (data ?? []) as unknown as ProductRow[]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register the products you produce. Each product can have many batches.
        </p>
      </header>

      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}
      {searchParams?.saved === '1' && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Changes saved.
        </p>
      )}

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Add a product</h2>
        <form action={createProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">
              Product name
            </label>
            <input id="name" name="name" required maxLength={120} className="input" placeholder="Cold-pressed olive oil" />
          </div>
          <div>
            <label htmlFor="sku" className="label">
              SKU
            </label>
            <input id="sku" name="sku" required maxLength={64} className="input" placeholder="ACME-OO-500" />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Category <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input id="category" name="category" maxLength={60} className="input" placeholder="Food & beverage" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea id="description" name="description" rows={2} maxLength={1000} className="input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Add product
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Your products <span className="text-slate-400">({products.length})</span>
        </h2>
        {products.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No products registered yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <li key={product.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{product.name}</h3>
                    <p className="font-mono text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-700">
                    {(product.batches?.length ?? 0)} batches
                  </span>
                </div>
                {product.category && <p className="mt-2 text-sm text-slate-600">{product.category}</p>}
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                )}
                <p className="mt-3 text-xs text-slate-400">Added {formatDate(product.created_at)}</p>
                <form action={deleteProduct} className="mt-3">
                  <input type="hidden" name="product_id" value={product.id} />
                  <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-500">
                    Delete product
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}