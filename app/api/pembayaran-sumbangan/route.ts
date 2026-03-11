import { NextRequest, NextResponse } from 'next/server';
import { supabase, CreatePembayaranSumbanganInput } from '@/lib/supabase';

// GET /api/pembayaran-sumbangan - List contribution payments with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status_pembayaran') || '';
    const tipe = searchParams.get('tipe_sumbangan') || '';
    const dateFrom = searchParams.get('tanggal_transaksi_from') || '';
    const dateTo = searchParams.get('tanggal_transaksi_to') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('pembayaran_sumbangan')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Search
    if (search) {
      query = query.or(
        `nama_anggota.ilike.%${search}%,nik.ilike.%${search}%,nomor_referensi.ilike.%${search}%`
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status_pembayaran', status);
    }

    // Filter by type
    if (tipe && tipe !== 'all') {
      query = query.eq('tipe_sumbangan', tipe);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('tanggal_transaksi', dateFrom);
    }
    if (dateTo) {
      query = query.lte('tanggal_transaksi', dateTo);
    }

    // Get paginated data
    const { data: pembayaran, error, count } = await query
      .order('tanggal_transaksi', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching pembayaran sumbangan:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pembayaran sumbangan', details: error.message },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: pembayaran || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/pembayaran-sumbangan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pembayaran-sumbangan - Create new contribution payment
export async function POST(request: NextRequest) {
  try {
    const body: CreatePembayaranSumbanganInput = await request.json();

    // Validate required fields
    const requiredFields = [
      'nama_anggota',
      'tanggal_transaksi',
      'jumlah_pembayaran',
      'tipe_sumbangan',
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreatePembayaranSumbanganInput]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Check if member exists (if anggota_id is provided)
    if (body.anggota_id) {
      const { data: member } = await supabase
        .from('anggota')
        .select('id')
        .eq('id', body.anggota_id)
        .single();

      if (!member) {
        return NextResponse.json(
          { error: 'Anggota not found' },
          { status: 404 }
        );
      }
    }

    // Generate reference number if not provided
    const nomorReferensi = body.nomor_referensi || `SUM-${Date.now()}`;

    // Create pembayaran sumbangan
    const { data: newPembayaran, error } = await supabase
      .from('pembayaran_sumbangan')
      .insert([{
        ...body,
        nik: body.nik || null,
        nomor_referensi: nomorReferensi,
        keterangan_pembayaran: body.keterangan_pembayaran || null,
        metode_pembayaran: body.metode_pembayaran || null,
        bukti_pembayaran: body.bukti_pembayaran || null,
        tanggal_verifikasi: body.tanggal_verifikasi || null,
        diverifikasi_oleh: body.diverifikasi_oleh || null,
        catatan_verifikasi: body.catatan_verifikasi || null,
        status_pembayaran: body.status_pembayaran || 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating pembayaran sumbangan:', error);
      return NextResponse.json(
        { error: 'Failed to create pembayaran sumbangan', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: newPembayaran,
      message: 'Pembayaran sumbangan berhasil ditambahkan',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/pembayaran-sumbangan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
