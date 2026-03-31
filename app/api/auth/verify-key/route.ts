import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest, getPresentedApiKey } from '@/lib/request-auth';
import { supabaseAdmin } from '@/lib/clerk-supabase';

export async function GET(request: NextRequest) {
  try {
    const presentedKey = getPresentedApiKey(request);
    const requestAuth = await authenticateRequest(request);

    if (!presentedKey || !requestAuth || requestAuth.authType !== 'api_key') {
      return NextResponse.json(
        { valid: false, error: { code: 'UNAUTHORIZED', message: 'Valid API key required' } },
        { status: 401 },
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, plan')
      .eq('id', requestAuth.profileId)
      .single();

    const { data: apiKey } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, last_used_at, total_requests, is_active, created_at')
      .eq('id', requestAuth.apiKeyId)
      .single();

    return NextResponse.json({
      valid: true,
      authType: 'api_key',
      profile: profile || null,
      apiKey: apiKey || null,
    });
  } catch (error) {
    console.error('Verify API key error:', error);
    return NextResponse.json(
      { valid: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to verify API key' } },
      { status: 500 },
    );
  }
}
