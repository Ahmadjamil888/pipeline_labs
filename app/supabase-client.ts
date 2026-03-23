import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://vuxkidbhyqguuivfjixi.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eGtpZGJoeXFndXVpdmZqaXhpIiwicm9sZSI6ImFub25fcm9sZSIsImlhdCI6MTc2NjkyMzE2NCwiZXhwIjoyMDgyNDk5MTY0fQ.jGnKIkBjfhY_0rHkBjkWNKus1NrXUs3iUw-qKzs_M90'

export const createClient = () =>
    createBrowserClient(
        SUPABASE_URL, 
        SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    // Both headers are required for Supabase REST API
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        }
    )
