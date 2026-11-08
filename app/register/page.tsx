import type { Metadata } from 'next'
import AuthForm from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your business account
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Register products, issue batch QR codes and publish verifiable batch
          histories. Free to use on the test network.
        </p>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}