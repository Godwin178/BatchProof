import type { Metadata } from 'next'
import AuthForm from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string }
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Sign in to manage your products, batches and verification pages.
        </p>
        <AuthForm mode="login" nextPath={searchParams?.next} />
      </div>
    </div>
  )
}