import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/clerk-supabase';
import { getRedisClient } from '@/lib/redis';
import { getStorageBackendName, isGcpStorageConfigured } from '@/lib/server-storage';

export async function GET(request: NextRequest) {
  const checks = {
    supabase: false,
    redis: false,
    openrouter: false,
  };

  const startTime = Date.now();

  // Check Supabase
  try {
    const { error } = await supabaseAdmin.from('datasets').select('id', { count: 'exact', head: true }).limit(1);
    checks.supabase = !error;
  } catch {
    checks.supabase = false;
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      checks.redis = true;
    }
  } catch {
    checks.redis = false;
  }

  // Check OpenRouter
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    checks.openrouter = response.ok;
  } catch {
    checks.openrouter = false;
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  const healthyCount = Object.values(checks).filter(Boolean).length;
  
  if (healthyCount === 0) {
    status = 'unhealthy';
  } else if (healthyCount < Object.keys(checks).length) {
    status = 'degraded';
  }

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    services: {
      supabase: checks.supabase ? 'connected' : 'disconnected',
      redis: checks.redis ? 'connected' : 'disconnected',
      openrouter: checks.openrouter ? 'available' : 'unavailable',
      storage: getStorageBackendName(),
    },
    storage: {
      activeBackend: getStorageBackendName(),
      gcpConfigured: isGcpStorageConfigured(),
      supabaseFallbackEnabled: true,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
}
