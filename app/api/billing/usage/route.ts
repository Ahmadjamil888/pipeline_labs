import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/clerk-supabase';

// Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get current month's start
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get usage stats
    const [
      { count: datasetsUploaded },
      { count: datasetsProcessed },
      { data: subscription },
    ] = await Promise.all([
      supabaseAdmin
        .from('datasets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth),
      supabaseAdmin
        .from('datasets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('processed_at', startOfMonth),
      supabaseAdmin
        .from('subscriptions')
        .select('plan:plan_id(*)')
        .eq('user_id', userId)
        .single(),
    ]);

    const planArray = subscription?.plan as { limits?: { maxDatasets?: number; maxRowsPerDataset?: number; maxProcessingPerMonth?: number } }[] | undefined;
    const plan = planArray?.[0];
    const limits = plan?.limits || {
      maxDatasets: 5,
      maxRowsPerDataset: 1000,
      maxProcessingPerMonth: 50,
    };

    return NextResponse.json({
      currentMonth: {
        datasetsUploaded: datasetsUploaded || 0,
        datasetsProcessed: datasetsProcessed || 0,
      },
      limits,
      remaining: {
        datasets: limits.maxDatasets ? limits.maxDatasets - (datasetsUploaded || 0) : null,
        processing: limits.maxProcessingPerMonth ? limits.maxProcessingPerMonth - (datasetsProcessed || 0) : null,
      },
    });

  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch usage statistics' } },
      { status: 500 }
    );
  }
}
