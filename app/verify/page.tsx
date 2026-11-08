import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify a batch',
}

export default function VerifyIndexPage({
  searchParams,
}: {
  searchParams?: { code?: string; error?: string }
}) {
  const code = searchParams?.code?.trim()
  if (code) {
    redirect(`/verify/${encodeURIComponent(code)}`)
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <div className="card text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify a batch</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the batch ID printed next to the QR code, or scan the code with
          your camera to open its verification page directly.
        </p>
        <form method="get" action="/verify" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="code"
            required
            maxLength={64}
            className="input flex-1"
            placeholder="e.g. BATCH-2024-0041"
            aria-label="Batch ID"
          />
          <button type="submit" className="btn-primary sm:w-auto">
            Verify
          </button>
        </form>
        {searchParams?.error && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {searchParams.error}
          </p>
        )}
      </div>
    </div>
  )
}