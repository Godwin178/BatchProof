import type { Metadata } from 'next'
import { requireUser, getProfile } from '@/lib/auth'
import { formatDateTime } from '@/lib/utils'
import { updateProfile } from '../actions'

export const metadata: Metadata = {
  title: 'Business profile',
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { error?: string; saved?: string }
}) {
  const user = await requireUser()
  const profile = await getProfile(user.id)

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your profile details appear on your dashboard. Batch records show the
          producer name you enter when registering each batch.
        </p>
      </header>

      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}
      {searchParams?.saved === '1' && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profile updated.
        </p>
      )}

      <section className="card">
        <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="business_name" className="label">
              Business name
            </label>
            <input
              id="business_name"
              name="business_name"
              required
              maxLength={120}
              defaultValue={profile?.business_name ?? ''}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="industry" className="label">
              Industry <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="industry"
              name="industry"
              maxLength={60}
              defaultValue={profile?.industry ?? ''}
              className="input"
              placeholder="Food & beverage"
            />
          </div>
          <div>
            <label htmlFor="website" className="label">
              Website <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              maxLength={200}
              defaultValue={profile?.website ?? ''}
              className="input"
              placeholder="https://example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">
              About your business <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={1000}
              defaultValue={profile?.description ?? ''}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="card text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-2">
          Email: <span className="font-medium text-slate-900">{profile?.contact_email ?? user.email}</span>
        </p>
        <p className="mt-1">
          Role: <span className="font-medium capitalize text-slate-900">{profile?.role ?? 'user'}</span>
        </p>
        <p className="mt-1">Member since: {formatDateTime(profile?.created_at)} UTC</p>
      </section>
    </div>
  )
}