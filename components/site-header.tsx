import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import BrandMark from '@/components/brand-mark'

const marketingLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#industries', label: 'Industries' },
  { href: '/verify', label: 'Verify' },
]

export default async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Batch<span className="text-indigo-600">Proof</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* JS-free mobile menu using <details>/<summary> */}
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            {user ? (
              <Link
                href="/dashboard"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  )
}
