import Link from 'next/link'
import { requireUser, getProfile } from '@/lib/auth'
import SignOutButton from '@/components/sign-out-button'
import BrandMark from '@/components/brand-mark'

const navLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/batches', label: 'Batches' },
  { href: '/dashboard/profile', label: 'Business profile' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const links = profile?.role === 'admin' ? [...navLinks, { href: '/dashboard/admin', label: 'Admin' }] : navLinks

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrandMark className="h-7 w-7" />
          <span className="font-bold tracking-tight text-slate-900">
            Batch<span className="text-indigo-600">Proof</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {profile?.business_name || user.email}
          </span>
          <SignOutButton className="btn-secondary" />
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  )
}