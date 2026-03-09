import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateAnggotaInput } from '@/lib/supabase';

// GET /api/anggota/[id] - Get single member by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { data: anggota, error } = await supabase
      .from('anggota')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !anggota) {
      return NextResponse.json(
        { error: 'Anggota not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: anggota });
  } catch (error) {
    console.error('Error in GET /api/anggota/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/anggota/[id] - Update member
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: UpdateAnggotaInput = await request.json();

    // Check if member exists
    const { data: existingAnggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existingAnggota) {
      return NextResponse.json(
        { error: 'Anggota not found' },
        { status: 404 }
      );
    }

    // Check for duplicate NIKAP (if changed)
    if (body.nikap) {
      const { data: duplicateNikap } = await supabase
        .from('anggota')
        .select('id')
        .eq('nikap', body.nikap)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (duplicateNikap) {
        return NextResponse.json(
          { error: 'NIKAP already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate NIK KTP (if changed)
    if (body.nik_ktp) {
      const { data: duplicateNikKtp } = await supabase
        .from('anggota')
        .select('id')
        .eq('nik_ktp', body.nik_ktp)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (duplicateNikKtp) {
        return NextResponse.json(
          { error: 'NIK KTP already exists' },
          { status: 409 }
        );
      }
    }

    // Update anggota
    const { data: updatedAnggota, error } = await supabase
      .from('anggota')
      .update({
        ...body,
        email: body.email || null,
        golongan_darah: body.golongan_darah || null,
        no_kk: body.no_kk || null,
        surat_nikah: body.surat_nikah || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating anggota:', error);
      return NextResponse.json(
        { error: 'Failed to update anggota', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedAnggota,
      message: 'Anggota berhasil diupdate',
    });

  } catch (error) {
    console.error('Error in PUT /api/anggota/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/anggota/[id] - Soft delete member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { data: existingAnggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existingAnggota) {
      return NextResponse.json(
        { error: 'Anggota not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('anggota')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting anggota:', error);
      return NextResponse.json(
        { error: 'Failed to delete anggota', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Anggota berhasil dihapus',
    });

  } catch (error) {
    console.error('Error in DELETE /api/anggota/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}