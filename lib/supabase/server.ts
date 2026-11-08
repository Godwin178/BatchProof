import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Cookie-based Supabase client for use in server components and server actions. */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a server component render pass — the middleware
            // refreshes the session so cookies stay valid.
          }
        },
      },
    },
  )
}
