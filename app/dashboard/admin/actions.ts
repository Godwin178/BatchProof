'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { isBatchStatus } from '@/lib/types'

function errorFor(message: string): never {
  redirect(`/dashboard/admin?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

export async function setUserRole(formData: FormData) {
  const { user } = await requireAdmin()
  const supabase = createClient()

  const targetId = text(formData, 'user_id')
  const role = text(formData, 'role')

  if (!['user', 'admin'].includes(role)) {
    errorFor('Invalid role selection.')
  }
  if (!targetId) {
    errorFor('User not found.')
  }
  if (targetId === user.id && role !== 'admin') {
    errorFor('You cannot remove your own admin role.')
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', targetId)
  if (error) {
    errorFor(error.message)
  }

  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin?saved=role')
}

export async function setReportStatus(formData: FormData) {
  await requireAdmin()
  const supabase = createClient()

  const reportId = text(formData, 'report_id')
  const status = text(formData, 'report_status')

  if (!['open', 'reviewed', 'resolved'].includes(status)) {
    errorFor('Invalid report status.')
  }
  if (!reportId) {
    errorFor('Report not found.')
  }

  const { error } = await supabase
    .from('reports')
    .update({ status, reviewed_at: status === 'open' ? null : new Date().toISOString() })
    .eq('id', reportId)

  if (error) {
    errorFor(error.message)
  }

  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin?saved=report')
}

export async function setBatchStatusAdmin(formData: FormData) {
  const { user } = await requireAdmin()
  const supabase = createClient()

  const batchId = text(formData, 'batch_id')
  const status = text(formData, 'batch_status')
  const notes = text(formData, 'notes')

  if (!isBatchStatus(status)) {
    errorFor('Invalid batch status.')
  }
  if (!batchId) {
    errorFor('Batch not found.')
  }
  if (status === 'revoked' && !notes) {
    errorFor('Revoking a batch requires a note explaining why.')
  }

  const { data: batch } = await supabase
    .from('batches')
    .select('id, status, batch_code')
    .eq('id', batchId)
    .maybeSingle()

  if (!batch) {
    errorFor('Batch not found.')
  }
  if (batch.status === status) {
    errorFor(`The batch is already marked ${status.replace(/_/g, ' ')}.`)
  }

  const { error } = await supabase.from('batches').update({ status }).eq('id', batchId)
  if (error) {
    errorFor(error.message)
  }

  await supabase.from('batch_events').insert({
    batch_id: batchId,
    event_type: 'status_update',
    status,
    notes: notes || `Status set to ${status.replace(/_/g, ' ')} by a platform administrator.`,
    created_by: user.id,
  })

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/batches')
  redirect(`/dashboard/admin?saved=batch`)
}