import { createBrowserClient } from '@supabase/ssr'

// Used in Client Components ('use client').
// Call createClient() wherever you need Supabase in the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYS!
  )
}