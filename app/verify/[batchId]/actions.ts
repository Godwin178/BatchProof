'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const REASONS = [
  'counterfeit_suspected',
  'label_mismatch',
  'expired_product',
  'broken_packaging',
  'other',
]

/**
 * Public report submission from a verification page. Anyone can file a
 * report; reports are reviewed in the platform admin area.
 */
export async function submitReport(formData: FormData) {
  const batchCode = String(formData.get('batch_code') ?? '').trim().toUpperCase()
  const reason = String(formData.get('reason') ?? '').trim()
  const details = String(formData.get('details') ?? '').trim()
  const reporterContact = String(formData.get('reporter_contact') ?? '').trim()

  const backPath = `/verify/${encodeURIComponent(batchCode)}`

  if (!batchCode) {
    redirect('/verify?error=' + encodeURIComponent('A batch ID is required to file a report.'))
  }
  if (!REASONS.includes(reason)) {
    redirect(`${backPath}?error=${encodeURIComponent('Please choose a reason for the report.')}`)
  }
  if (details.length > 2000) {
    redirect(`${backPath}?error=${encodeURIComponent('Report details are limited to 2000 characters.')}`)
  }

  const supabase = createClient()
  const { error } = await supabase.from('reports').insert({
    batch_code: batchCode,
    reason,
    details: details || null,
    reporter_contact: reporterContact || null,
  })

  if (error) {
    redirect(`${backPath}?error=${encodeURIComponent('The report could not be submitted. Please try again.')}`)
  }

  revalidatePath('/dashboard/admin')
  redirect(`${backPath}?reported=1`)
}