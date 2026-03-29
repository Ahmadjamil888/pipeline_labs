import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, STORAGE_BUCKETS, downloadFromStorage } from '@/lib/clerk-supabase';
import { parseFile, dataframeToCsv, dataframeToJson, getDatasetStats } from '@/lib/preprocessing';
import { getCache, setCache } from '@/lib/redis';
import * as XLSX from 'xlsx';

// List datasets
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');

    // Resolve profile UUID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    // Build query
    let query = supabaseAdmin
      .from('datasets')
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });

  } catch (error) {
    console.error('List datasets error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch datasets' } },
      { status: 500 }
    );
  }
}

// Delete dataset
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing dataset ID' } },
        { status: 400 }
      );
    }

    // Resolve profile UUID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const profileId = profile?.id || userId;

    // Get dataset to find storage paths
    const { data: dataset, error: fetchError } = await supabaseAdmin
      .from('datasets')
      .select('storage_path, processed_path')
      .eq('id', id)
      .eq('user_id', profileId)
      .single();

    if (fetchError || !dataset) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Dataset not found' } },
        { status: 404 }
      );
    }

    // Delete from storage
    const pathsToDelete = [
      dataset.storage_path,
      dataset.processed_path,
    ].filter(Boolean) as string[];

    if (pathsToDelete.length > 0) {
      await supabaseAdmin.storage.from('datasets').remove(pathsToDelete);
    }

    // Soft delete in database
    const { error: deleteError } = await supabaseAdmin
      .from('datasets')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', profileId);

    if (deleteError) {
      throw deleteError;
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: profileId,
      action: 'dataset.delete',
      entity_type: 'dataset',
      entity_id: id,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete dataset error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete dataset' } },
      { status: 500 }
    );
  }
}
