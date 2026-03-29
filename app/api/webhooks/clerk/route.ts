import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get headers - headers() returns a Promise in Next.js
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Verify webhook headers exist
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers')
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: 400 }
    )
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  const eventType = evt.type
  console.log(`Webhook received: ${eventType}`)

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const user = evt.data
        const primaryEmail = user.email_addresses?.find(
          (email: any) => email.id === user.primary_email_address_id
        )?.email_address

        if (!primaryEmail) {
          console.log('No primary email found for user:', user.id)
          return NextResponse.json({ received: true })
        }

        // Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', user.id)
          .single()

        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              email: primaryEmail,
              first_name: user.first_name,
              last_name: user.last_name,
              avatar_url: user.image_url,
              updated_at: new Date().toISOString()
            })
            .eq('clerk_user_id', user.id)

          if (updateError) {
            console.error('Error updating profile:', updateError)
            return NextResponse.json(
              { error: 'Failed to update profile' },
              { status: 500 }
            )
          }
          console.log('Profile updated for user:', user.id)
        } else {
          // Create new profile with trial plan
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              clerk_user_id: user.id,
              email: primaryEmail,
              first_name: user.first_name,
              last_name: user.last_name,
              avatar_url: user.image_url,
              plan: 'trial',
              trial_start_date: new Date().toISOString(),
              trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
            return NextResponse.json(
              { error: 'Failed to create profile' },
              { status: 500 }
            )
          }
          console.log('Profile created for user:', user.id)
        }
        break
      }

      case 'user.deleted': {
        const user = evt.data
        
        // Soft delete - just mark as deleted
        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('clerk_user_id', user.id)

        if (deleteError) {
          console.error('Error deleting profile:', deleteError)
          return NextResponse.json(
            { error: 'Failed to delete profile' },
            { status: 500 }
          )
        }
        console.log('Profile soft-deleted for user:', user.id)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Clerk webhook endpoint' })
}
