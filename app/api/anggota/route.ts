import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CreateAnggotaInput, AnggotaFilter } from '@/lib/supabase';

// GET /api/anggota - Get all members with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategori_anggota = searchParams.get('kategori_anggota') || 'all';
    const status_anggota = searchParams.get('status_anggota') || 'all';
    const status_mps = searchParams.get('status_mps') || 'all';
    const status_iuran = searchParams.get('status_iuran') || 'all';
    const nama_cabang = searchParams.get('nama_cabang') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('anggota')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Search filter
    if (search) {
      query = query.or(`nama_anggota.ilike.%${search}%,nik.ilike.%${search}%,nama_cabang.ilike.%${search}%`);
    }

    // Status filters
    if (kategori_anggota !== 'all') {
      query = query.eq('kategori_anggota', kategori_anggota);
    }
    if (status_anggota !== 'all') {
      query = query.eq('status_anggota', status_anggota);
    }
    if (status_mps !== 'all') {
      query = query.eq('status_mps', status_mps);
    }
    if (status_iuran !== 'all') {
      query = query.eq('status_iuran', status_iuran);
    }
    if (nama_cabang !== 'all') {
      query = query.eq('nama_cabang', nama_cabang);
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
      'nik', 'nama_anggota', 'kategori_anggota', 'status_anggota',
      'status_mps', 'status_iuran', 'nama_cabang', 'posisi_kepengurusan', 'alamat'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreateAnggotaInput]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate NIK
    const { data: existingNik } = await supabase
      .from('anggota')
      .select('id')
      .eq('nik', body.nik)
      .is('deleted_at', null)
      .single();

    if (existingNik) {
      return NextResponse.json(
        { error: 'NIK already exists' },
        { status: 409 }
      );
    }

    // Create new anggota
    const { data: newAnggota, error } = await supabase
      .from('anggota')
      .insert([{
        ...body,
        alamat: body.alamat || null,
        rt: body.rt || null,
        rw: body.rw || null,
        kelurahan: body.kelurahan || null,
        kecamatan: body.kecamatan || null,
        provinsi: body.provinsi || null,
        kota: body.kota || null,
        kode_pos: body.kode_pos || null,
        nomor_handphone: body.nomor_handphone || null,
        nomor_telepon: body.nomor_telepon || null,
        email: body.email || null,
        sosial_media: body.sosial_media || null,
        e_ktp: body.e_ktp || null,
        kartu_keluarga: body.kartu_keluarga || null,
        npwp: body.npwp || null,
        tempat_lahir: body.tempat_lahir || null,
        tanggal_lahir: body.tanggal_lahir || null,
        jenis_kelamin: body.jenis_kelamin || null,
        agama: body.agama || null,
        golongan_darah: body.golongan_darah || null,
        besaran_iuran: body.besaran_iuran || null,
        form_kesediaan_iuran: body.form_kesediaan_iuran || null,
        nama_bank: body.nama_bank || null,
        norek_bank: body.norek_bank || null,
        kategori_bantuan: body.kategori_bantuan || null,
        tanggal_terima_bantuan: body.tanggal_terima_bantuan || null,
        gambar_kondisi_tempat_tinggal: body.gambar_kondisi_tempat_tinggal || null,
        alasan_mutasi: body.alasan_mutasi || null,
        tanggal_mutasi: body.tanggal_mutasi || null,
        cabang_pengajuan_mutasi: body.cabang_pengajuan_mutasi || null,
        pusat_pengesahan_mutasi: body.pusat_pengesahan_mutasi || null,
        status_bpjs: body.status_bpjs || null,
        bpjs_kelas: body.bpjs_kelas || null,
        bpjs_insentif: body.bpjs_insentif || null,
        kategori_datul: body.kategori_datul || null,
        media_datul: body.media_datul || null,
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