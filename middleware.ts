import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request)
  return response
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets and image optimisation routes,
     * so the Supabase session stays refreshed across the whole app.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
