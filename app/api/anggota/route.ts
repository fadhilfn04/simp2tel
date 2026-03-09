import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CreateAnggotaInput, AnggotaFilter } from '@/lib/supabase';

// GET /api/anggota - Get all members with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status_anggota = searchParams.get('status_anggota') || 'all';
    const jenis_anggota = searchParams.get('jenis_anggota') || 'all';
    const status_iuran = searchParams.get('status_iuran') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('anggota')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Search filter
    if (search) {
      query = query.or(`nama.ilike.%${search}%,nikap.ilike.%${search}%,cabang_domisili.ilike.%${search}%`);
    }

    // Status filters
    if (status_anggota !== 'all') {
      query = query.eq('status_anggota', status_anggota);
    }
    if (jenis_anggota !== 'all') {
      query = query.eq('jenis_anggota', jenis_anggota);
    }
    if (status_iuran !== 'all') {
      query = query.eq('status_iuran', status_iuran);
    }

    // Get paginated data
    const { data: anggota, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching anggota:', error);
      return NextResponse.json(
        { error: 'Failed to fetch anggota data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: anggota || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/anggota:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/anggota - Create new member
export async function POST(request: NextRequest) {
  try {
    const body: CreateAnggotaInput = await request.json();

    // Validate required fields
    const requiredFields = [
      'nikap', 'nik_ktp', 'nama', 'status_anggota', 'jenis_anggota',
      'status_iuran', 'status_kesehatan', 'tempat_lahir', 'tanggal_lahir',
      'jenis_kelamin', 'agama', 'status_perkawinan', 'sk_pensiun',
      'nomor_kontak', 'alamat', 'rt', 'rw', 'kelurahan', 'kecamatan',
      'kota', 'kode_pos', 'cabang_domisili'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreateAnggotaInput]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate NIKAP
    const { data: existingNikap } = await supabase
      .from('anggota')
      .select('id')
      .eq('nikap', body.nikap)
      .is('deleted_at', null)
      .single();

    if (existingNikap) {
      return NextResponse.json(
        { error: 'NIKAP already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate NIK KTP
    const { data: existingNikKtp } = await supabase
      .from('anggota')
      .select('id')
      .eq('nik_ktp', body.nik_ktp)
      .is('deleted_at', null)
      .single();

    if (existingNikKtp) {
      return NextResponse.json(
        { error: 'NIK KTP already exists' },
        { status: 409 }
      );
    }

    // Create new anggota
    const { data: newAnggota, error } = await supabase
      .from('anggota')
      .insert([{
        ...body,
        email: body.email || null,
        golongan_darah: body.golongan_darah || null,
        no_kk: body.no_kk || null,
        surat_nikah: body.surat_nikah || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating anggota:', error);
      return NextResponse.json(
        { error: 'Failed to create anggota', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: newAnggota,
      message: 'Anggota berhasil ditambahkan',
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/anggota:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}