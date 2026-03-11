import { NextRequest, NextResponse } from 'next/server';
import { supabase, UpdatePembayaranSumbanganInput } from '@/lib/supabase';

// GET /api/pembayaran-sumbangan/[id] - Get single contribution payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: pembayaran, error } = await supabase
      .from('pembayaran_sumbangan')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !pembayaran) {
      return NextResponse.json(
        { error: 'Pembayaran sumbangan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: pembayaran });
  } catch (error) {
    console.error('Error in GET /api/pembayaran-sumbangan/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/pembayaran-sumbangan/[id] - Update contribution payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePembayaranSumbanganInput = await request.json();

    // Check if payment exists
    const { data: existingPayment } = await supabase
      .from('pembayaran_sumbangan')
      .select('id, status_pembayaran')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Pembayaran sumbangan not found' },
        { status: 404 }
      );
    }

    // Prevent modification if already paid
    if (existingPayment.status_pembayaran === 'paid' && body.status_pembayaran !== 'paid') {
      return NextResponse.json(
        { error: 'Cannot modify status of paid payment' },
        { status: 400 }
      );
    }

    // Update pembayaran sumbangan
    const { data: updatedPembayaran, error } = await supabase
      .from('pembayaran_sumbangan')
      .update({
        ...body,
        tanggal_verifikasi: body.tanggal_verifikasi !== undefined ? body.tanggal_verifikasi : undefined,
        diverifikasi_oleh: body.diverifikasi_oleh !== undefined ? body.diverifikasi_oleh : undefined,
        catatan_verifikasi: body.catatan_verifikasi !== undefined ? body.catatan_verifikasi : undefined,
        keterangan_pembayaran: body.keterangan_pembayaran !== undefined ? body.keterangan_pembayaran : undefined,
        metode_pembayaran: body.metode_pembayaran !== undefined ? body.metode_pembayaran : undefined,
        bukti_pembayaran: body.bukti_pembayaran !== undefined ? body.bukti_pembayaran : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pembayaran sumbangan:', error);
      return NextResponse.json(
        { error: 'Failed to update pembayaran sumbangan', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedPembayaran,
      message: 'Pembayaran sumbangan berhasil diupdate',
    });

  } catch (error) {
    console.error('Error in PUT /api/pembayaran-sumbangan/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/pembayaran-sumbangan/[id] - Soft delete contribution payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if payment exists
    const { data: existingPayment } = await supabase
      .from('pembayaran_sumbangan')
      .select('id, status_pembayaran')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Pembayaran sumbangan not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if already paid
    if (existingPayment.status_pembayaran === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid payment' },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('pembayaran_sumbangan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting pembayaran sumbangan:', error);
      return NextResponse.json(
        { error: 'Failed to delete pembayaran sumbangan', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pembayaran sumbangan berhasil dihapus',
    });

  } catch (error) {
    console.error('Error in DELETE /api/pembayaran-sumbangan/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
