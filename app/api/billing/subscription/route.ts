import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/clerk-supabase';

const POLAR_API_KEY = process.env.POLAR_API_KEY;
const POLAR_API_URL = 'https://api.polar.sh/v1';

// Polar API client
async function polarApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${POLAR_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${POLAR_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Polar API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Get current subscription
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get subscription from database
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      // Return free plan if no subscription found
      const { data: freePlan } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('slug', 'free')
        .single();

      return NextResponse.json({
        subscription: null,
        plan: freePlan || {
          name: 'Free',
          slug: 'free',
          limits: { maxDatasets: 5, maxRowsPerDataset: 1000, maxProcessingPerMonth: 50 },
        },
        status: 'inactive',
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        polarSubscriptionId: subscription.polar_subscription_id,
      },
      plan: subscription.plan,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subscription' } },
      { status: 500 }
    );
  }
}

// Create checkout session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { priceId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing priceId' } },
        { status: 400 }
      );
    }

    // Get or create customer in Polar
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    // Create checkout session via Polar
    const checkout = await polarApi('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
        customer_email: profile?.email,
        customer_name: profile?.full_name,
        metadata: {
          userId: userId,
        },
      }),
    });

    return NextResponse.json({
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' } },
      { status: 500 }
    );
  }
}
