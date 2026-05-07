import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Used in Server Components and Server Actions ('use server').
// Note: Next.js 15 makes cookies() async — the await below handles both 14 and 15.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEYS!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe to ignore in Server Components — they can't set cookies directly.
          }
        },
      },
    }
  )
}