import { NextRequest, NextResponse } from 'next/server';
import { supabase, UpdateDanaKematianInput } from '@/lib/supabase';

// GET /api/dana-kematian/[id] - Get single death benefit claim by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: danaKematian, error } = await supabase
      .from('dana_kematian')
      .select('*, anggota!inner(nama, nikap, cabang_domisili)')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (error || !danaKematian) {
      return NextResponse.json(
        { error: 'Dana kematian not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: danaKematian });
  } catch (error) {
    console.error('Error in GET /api/dana-kematian/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/dana-kematian/[id] - Update death benefit claim
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateDanaKematianInput = await request.json();

    // Check if claim exists
    const { data: existingClaim } = await supabase
      .from('dana_kematian')
      .select('id')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (!existingClaim) {
      return NextResponse.json(
        { error: 'Dana kematian not found' },
        { status: 404 }
      );
    }

    // Check for duplicate death certificate (if changed)
    if (body.no_surat_kematian) {
      const { data: duplicateCert } = await supabase
        .from('dana_kematian')
        .select('id')
        .eq('no_surat_kematian', body.no_surat_kematian)
        .neq('id', params.id)
        .is('deleted_at', null)
        .single();

      if (duplicateCert) {
        return NextResponse.json(
          { error: 'Nomor surat kematian already exists' },
          { status: 409 }
        );
      }
    }

    // Update dana kematian
    const { data: updatedDanaKematian, error } = await supabase
      .from('dana_kematian')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dana kematian:', error);
      return NextResponse.json(
        { error: 'Failed to update dana kematian', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedDanaKematian,
      message: 'Dana kematian berhasil diupdate',
    });

  } catch (error) {
    console.error('Error in PUT /api/dana-kematian/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/dana-kematian/[id] - Soft delete death benefit claim
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if claim exists
    const { data: existingClaim } = await supabase
      .from('dana_kematian')
      .select('id, status_pengajuan')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (!existingClaim) {
      return NextResponse.json(
        { error: 'Dana kematian not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if already paid or completed
    if (existingClaim.status_pengajuan === 'Dibayar' || existingClaim.status_pengajuan === 'Selesai') {
      return NextResponse.json(
        { error: 'Cannot delete claim that has been paid or completed' },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('dana_kematian')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting dana kematian:', error);
      return NextResponse.json(
        { error: 'Failed to delete dana kematian', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Dana kematian berhasil dihapus',
    });

  } catch (error) {
    console.error('Error in DELETE /api/dana-kematian/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}