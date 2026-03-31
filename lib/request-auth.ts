import { createHash } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

import { supabaseAdmin } from '@/lib/clerk-supabase';

export type RequestAuth =
  | {
      authType: 'clerk';
      profileId: string;
      clerkUserId: string;
    }
  | {
      authType: 'api_key';
      profileId: string;
      apiKeyId: string;
    };

function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function readApiKey(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.slice(7).trim();
    if (token.startsWith('pl_live_') || token.startsWith('pipe_')) return token;
  }

  const headerKey = request.headers.get('x-api-key')?.trim();
  return headerKey || null;
}

async function resolveProfileFromClerk(clerkUserId: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  return data?.id as string | undefined;
}

async function resolveProfileFromApiKey(apiKey: string) {
  const keyHash = sha256Hex(apiKey);
  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, key_full, key_hash, is_active, total_requests')
    .eq('is_active', true);

  const match = (keys || []).find((key) => key.key_full === apiKey || key.key_hash === keyHash);
  if (!match) return null;

  await supabaseAdmin
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: (match.total_requests || 0) + 1,
    })
    .eq('id', match.id);

  return {
    authType: 'api_key' as const,
    profileId: match.user_id as string,
    apiKeyId: match.id as string,
  };
}

export async function authenticateRequest(request: NextRequest): Promise<RequestAuth | null> {
  const { userId } = await auth();
  if (userId) {
    const profileId = await resolveProfileFromClerk(userId);
    if (!profileId) return null;

    return {
      authType: 'clerk',
      profileId,
      clerkUserId: userId,
    };
  }

  const apiKey = readApiKey(request);
  if (!apiKey) return null;

  return resolveProfileFromApiKey(apiKey);
}

export function getPresentedApiKey(request: NextRequest) {
  return readApiKey(request);
}
