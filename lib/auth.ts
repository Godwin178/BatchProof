import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return (data as unknown as Profile) ?? null
}

/** Guard for the admin area. Redirects non-admins to the dashboard. */
export async function requireAdmin() {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  return { user, profile }
}
