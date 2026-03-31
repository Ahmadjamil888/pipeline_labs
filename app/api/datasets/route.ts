import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/clerk-supabase';
import { authenticateRequest } from '@/lib/request-auth';
import { STORAGE_BUCKETS, deleteFromStorage } from '@/lib/server-storage';

// List datasets
export async function GET(request: NextRequest) {
  try {
    const requestAuth = await authenticateRequest(request);

    if (!requestAuth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    const profileId = requestAuth.profileId;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');

    // Build query
    let query = supabaseAdmin
      .from('datasets')
      .select('*', { count: 'exact' })
      .eq('user_id', profileId)
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
    const requestAuth = await authenticateRequest(request);

    if (!requestAuth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    const profileId = requestAuth.profileId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing dataset ID' } },
        { status: 400 }
      );
    }

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
    if (dataset.storage_path) {
      await deleteFromStorage(STORAGE_BUCKETS.DATASETS, [dataset.storage_path]);
    }

    if (dataset.processed_path) {
      await deleteFromStorage(STORAGE_BUCKETS.PROCESSED, [dataset.processed_path]);
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
