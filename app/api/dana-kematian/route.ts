import { NextRequest, NextResponse } from 'next/server';
import { supabase, DanaKematian, CreateDanaKematianInput, DanaKematianFilter } from '@/lib/supabase';

// GET /api/dana-kematian - List death benefits with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status_pengajuan') || '';
    const dateFrom = searchParams.get('tanggal_meninggal_from') || '';
    const dateTo = searchParams.get('tanggal_meninggal_to') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('dana_kematian')
      .select('*, anggota!inner(nama, nikap, cabang_domisili)')
      .is('deleted_at', null);

    // Search
    if (search) {
      query = query.or(
        `nama_meninggal.ilike.%${search}%,nik_ktp_meninggal.ilike.%${search}%,nikap_meninggal.ilike.%${search}%,nama_ahli_waris.ilike.%${search}%`
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status_pengajuan', status);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('tanggal_meninggal', dateFrom);
    }
    if (dateTo) {
      query = query.lte('tanggal_meninggal', dateTo);
    }

    // Get total count
    const { count, error: countError } = await query;

    if (countError) {
      console.error('Error counting dana kematian:', countError);
      return NextResponse.json(
        { error: 'Failed to count records' },
        { status: 500 }
      );
    }

    // Get paginated data
    const { data: danaKematian, error } = await query
      .order('tanggal_pengajuan', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching dana kematian:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dana kematian' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: danaKematian,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dana-kematian:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/dana-kematian - Create new death benefit claim
export async function POST(request: NextRequest) {
  try {
    const body: CreateDanaKematianInput = await request.json();

    // Validate required fields
    const requiredFields = [
      'anggota_id',
      'nama_meninggal',
      'nik_ktp_meninggal',
      'nikap_meninggal',
      'tanggal_meninggal',
      'tempat_meninggal',
      'nama_ahli_waris',
      'hubungan_ahli_waris',
      'nik_ktp_ahli_waris',
      'alamat_ahli_waris',
      'nomor_kontak_ahli_waris',
      'jumlah_uang_duka',
    ];

    for (const field of requiredFields) {
      if (!body[field as string]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate death certificate
    if (body.no_surat_kematian) {
      const { data: existingCert } = await supabase
        .from('dana_kematian')
        .select('id')
        .eq('no_surat_kematian', body.no_surat_kematian)
        .is('deleted_at', null)
        .single();

      if (existingCert) {
        return NextResponse.json(
          { error: 'Nomor surat kematian already exists' },
          { status: 409 }
        );
      }
    }

    // Check if member exists
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

    // Create dana kematian
    const { data: newDanaKematian, error } = await supabase
      .from('dana_kematian')
      .insert({
        ...body,
        status_pengajuan: body.status_pengajuan || 'Pending',
        mata_uang: body.mata_uang || 'IDR',
        tanggal_pengajuan: body.tanggal_pengajuan || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dana kematian:', error);
      return NextResponse.json(
        { error: 'Failed to create dana kematian', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: newDanaKematian,
      message: 'Dana kematian berhasil diajukan',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/dana-kematian:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}