'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'login' | 'register'
  nextPath?: string
}

export default function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)

    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const businessName = String(data.get('business_name') ?? '').trim()

    try {
      const supabase = createClient()

      if (mode === 'register') {
        const { data: result, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { business_name: businessName } },
        })
        if (error) {
          setError(error.message)
          return
        }
        if (!result.session) {
          setNotice(
            'Account created. Check your email inbox for a confirmation link, then sign in.',
          )
          form.reset()
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
          return
        }
      }

      router.replace(nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label htmlFor="business_name" className="label">
            Business name
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            maxLength={120}
            className="input"
            placeholder="Acme Organic Foods"
            autoComplete="organization"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
          placeholder="At least 8 characters"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === 'register' ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to BatchProof?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}