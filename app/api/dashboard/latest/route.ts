import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'both';
    const limit = parseInt(searchParams.get('limit') || '5');

    let data: any = {};

    // Get latest anggota
    if (type === 'anggota' || type === 'both') {
      const { data: latestAnggota } = await supabase
        .from('anggota')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      data.anggota = latestAnggota || [];
    }

    // Get latest dana kematian claims
    if (type === 'klaim' || type === 'both') {
      const { data: latestKlaim } = await supabase
        .from('dana_kematian')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      data.klaim = latestKlaim || [];
    }

    // Get latest dana sosial
    if (type === 'sosial' || type === 'both') {
      const { data: latestSosial } = await supabase
        .from('dana_sosial')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      data.sosial = latestSosial || [];
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching latest data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch latest data' },
      { status: 500 }
    );
  }
}
