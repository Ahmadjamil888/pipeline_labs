'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from './clerk-supabase-client'

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    eq?: { column: string; value: unknown }
  }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUser()
  const client = useClerkSupabaseClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      try {
        let query = client.from(table).select(options?.select || '*')

        if (options?.eq) {
          query = query.eq(options.eq.column, options.eq.value)
        }

        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? false,
          })
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data: result, error: supabaseError } = await query

        if (supabaseError) throw supabaseError
        setData((result as T[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, table, client, JSON.stringify(options)])

  return { data, loading, error, refresh: () => window.location.reload() }
}

export function useSupabaseRealtime<T>(
  table: string,
  options?: {
    select?: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  }
) {
  const [data, setData] = useState<T[]>([])
  const { user } = useUser()
  const client = useClerkSupabaseClient()

  useEffect(() => {
    if (!user) return

    // Initial fetch
    client
      .from(table)
      .select(options?.select || '*')
      .then(({ data: result }) => {
        if (result) setData(result as T[])
      })

    // Subscribe to changes
    const subscription = client
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: 'public',
          table,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                (item as { id: string }).id === (payload.new as { id: string }).id
                  ? (payload.new as T)
                  : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter(
                (item) => (item as { id: string }).id !== (payload.old as { id: string }).id
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, table, client, options?.event, options?.select])

  return { data, setData }
}
