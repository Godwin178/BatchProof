'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ className = 'btn-secondary' }: { className?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.replace('/')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={signOut} disabled={busy} className={className}>
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}