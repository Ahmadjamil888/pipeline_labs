'use client'

import { useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug: Log env var status (remove after fixing)
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('Supabase Key:', supabaseKey ? '✓ Set' : '✗ Missing')
}

export function useClerkSupabaseClient() {
  const { session } = useSession()

  const client = useMemo(() => {
    return createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: 'supabase',
            })

            const headers = new Headers(options?.headers)
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`)
            }

            return fetch(url, {
              ...options,
              headers,
            })
          },
        },
      },
    )
  }, [session])

  return client
}
