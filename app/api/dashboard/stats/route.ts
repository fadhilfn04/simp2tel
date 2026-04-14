import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total anggota
    const { count: totalAnggota } = await supabase
      .from('anggota')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get active anggota
    const { count: anggotaAktif } = await supabase
      .from('anggota')
      .select('*', { count: 'exact', head: true })
      .neq('status_anggota', 'meninggal')
      .is('deleted_at', null);

    // Get deceased anggota
    const { count: anggotaMeninggal } = await supabase
      .from('anggota')
      .select('*', { count: 'exact', head: true })
      .eq('status_anggota', 'meninggal')
      .is('deleted_at', null);

    // Get total dana kematian claims
    const { count: totalKlaim } = await supabase
      .from('dana_kematian')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get pending claims
    const { count: klaimPending } = await supabase
      .from('dana_kematian')
      .select('*', { count: 'exact', head: true })
      .eq('status_pengajuan', 'Pending')
      .is('deleted_at', null);

    // Get total disbursed amount
    const { data: disbursedClaims } = await supabase
      .from('dana_kematian')
      .select('jumlah_uang_duka')
      .in('status_pengajuan', ['Dibayar', 'Selesai'])
      .is('deleted_at', null);

    const totalDicairkan = disbursedClaims?.reduce((sum, claim) => sum + (claim.jumlah_uang_duka || 0), 0) || 0;

    // Get total dana sosial
    const { count: totalDanaSosial } = await supabase
      .from('dana_sosial')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get pending dana sosial
    const { count: danaSosialPending } = await supabase
      .from('dana_sosial')
      .select('*', { count: 'exact', head: true })
      .eq('status_pengajuan', 'Pending')
      .is('deleted_at', null);

    // Get total dana sosial disbursed
    const { data: disbursedSosial } = await supabase
      .from('dana_sosial')
      .select('jumlah_disetujui')
      .in('status_pengajuan', ['Disalurkan', 'Selesai'])
      .is('deleted_at', null);

    const totalDanaSosialDicairkan = disbursedSosial?.reduce((sum, claim) => sum + (claim.jumlah_disetujui || 0), 0) || 0;

    return NextResponse.json({
      totalAnggota: totalAnggota || 0,
      anggotaAktif: anggotaAktif || 0,
      anggotaMeninggal: anggotaMeninggal || 0,
      totalKlaim: totalKlaim || 0,
      klaimPending: klaimPending || 0,
      totalDicairkan: totalDicairkan,
      totalDanaSosial: totalDanaSosial || 0,
      danaSosialPending: danaSosialPending || 0,
      totalDanaSosialDicairkan: totalDanaSosialDicairkan,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
