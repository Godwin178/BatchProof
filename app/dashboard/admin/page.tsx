import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, humanStatus, statusBadge } from '@/lib/utils'
import type { Batch, Profile, Report } from '@/lib/types'
import { setUserRole, setReportStatus, setBatchStatusAdmin } from './actions'

export const metadata: Metadata = {
  title: 'Admin',
}

type BatchRow = Batch & { products: { name: string } | null }

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { error?: string; saved?: string }
}) {
  await requireAdmin()
  const supabase = createClient()

  const [profilesResult, reportsResult, batchesResult] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100),
    supabase
      .from('batches')
      .select('*, products (name)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const profiles = (profilesResult.data ?? []) as unknown as Profile[]
  const reports = (reportsResult.data ?? []) as unknown as Report[]
  const batches = (batchesResult.data ?? []) as unknown as BatchRow[]
  const openReports = reports.filter((report) => report.status === 'open')

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform oversight: users, public reports and batch records.
        </p>
      </header>

      {searchParams?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}
      {searchParams?.saved && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Change applied.
        </p>
      )}

      {/* Reports */}
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">
          Reports{' '}
          {openReports.length > 0 && (
            <span className="badge bg-red-100 text-red-700">{openReports.length} open</span>
          )}
        </h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No reports filed.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {reports.map((report) => (
              <li key={report.id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`badge ${
                      report.status === 'open'
                        ? 'bg-red-100 text-red-700'
                        : report.status === 'reviewed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {report.reason.replace(/_/g, ' ')}
                  </span>
                  <Link
                    href={`/verify/${encodeURIComponent(report.batch_code)}`}
                    className="font-mono text-xs font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {report.batch_code}
                  </Link>
                  <span className="text-xs text-slate-400">{formatDateTime(report.created_at)} UTC</span>
                </div>
                {report.details && <p className="text-sm text-slate-600">{report.details}</p>}
                {report.reporter_contact && (
                  <p className="text-xs text-slate-500">Reporter: {report.reporter_contact}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <form action={setReportStatus}>
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="report_status" value="reviewed" />
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      Mark reviewed
                    </button>
                  </form>
                  <form action={setReportStatus}>
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="report_status" value="resolved" />
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      Mark resolved
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Users */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold text-slate-900">Users ({profiles.length})</h2>
        {profiles.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No users yet.</p>
        ) : (
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4">Business</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Joined</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Change role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {profile.business_name || '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{profile.contact_email ?? '—'}</td>
                  <td className="py-3 pr-4 text-slate-600">{formatDate(profile.created_at)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`badge ${
                        profile.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {profile.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={profile.id} />
                      <select
                        name="role"
                        defaultValue={profile.role}
                        aria-label={`Role for ${profile.contact_email ?? profile.id}`}
                        className="input w-28 py-1.5 text-xs"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                        Apply
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Batch oversight */}
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Recent batches</h2>
        <p className="mt-1 text-sm text-slate-600">
          Revoke or restore batches when reports are substantiated. Revocation
          requires a note and is logged in the batch history.
        </p>
        {batches.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No batches registered yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {batches.map((batch) => (
              <li key={batch.id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/batches/${batch.id}`}
                    className="font-mono text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    {batch.batch_code}
                  </Link>
                  <span className={`badge ${statusBadge(batch)}`}>{humanStatus(batch.status)}</span>
                  <span className="text-sm text-slate-600">{batch.products?.name ?? '—'}</span>
                  <span className="text-xs text-slate-400">by {batch.producer_name}</span>
                </div>
                <form action={setBatchStatusAdmin} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input type="hidden" name="batch_id" value={batch.id} />
                  <select
                    name="batch_status"
                    defaultValue={batch.status === 'revoked' ? 'registered' : 'revoked'}
                    className="input w-full sm:w-44"
                    aria-label="New status"
                  >
                    <option value="revoked">revoked</option>
                    <option value="registered">registered (restore)</option>
                  </select>
                  <input
                    name="notes"
                    maxLength={500}
                    placeholder="Reason (required to revoke)"
                    className="input flex-1"
                  />
                  <button type="submit" className="btn-danger sm:w-auto">
                    Apply
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