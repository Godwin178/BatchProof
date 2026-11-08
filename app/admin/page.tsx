
import type { Metadata } from 'next'
import AuthForm from '@/components/auth-form'
import BrandMark from '@/components/brand-mark'

export const metadata: Metadata = {
  title: 'Administrator Sign In',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-md items-center px-4 py-12">
      <section className="card w-full">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark className="h-9 w-9" />
          <div>
            <p className="font-bold tracking-tight text-slate-900">
              Batch<span className="text-indigo-600">Proof</span>
            </p>
            <p className="text-xs text-slate-500">
              Platform Administration
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Login
        </h1>

        <p className="mb-6 mt-2 text-sm text-slate-600">
          Sign in with your registered BatchProof administrator account.
          Only accounts with administrator permissions can access the dashboard.
        </p>

        <AuthForm mode="login" nextPath="/dashboard/admin" />

        <p className="mt-5 text-center text-xs text-slate-500">
          Secure Administrator Access
        </p>
      </section>
    </main>
  )
}
