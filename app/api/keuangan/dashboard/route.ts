import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/keuangan/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // today, week, month, year

    // Calculate date range based on period
    const now = new Date();
    const from = new Date();

    switch (period) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
    }

    const fromDate = from.toISOString().split('T')[0];
    const toDate = now.toISOString().split('T')[0];

    // Fetch data from multiple tables in parallel
    const [
      arusKasResult,
      pembayaranSumbanganResult,
      laporanPeriodeResult,
      danaKematianResult,
      danaSosialResult,
      anggotaResult,
    ] = await Promise.all([
      // Cash flow data
      supabase
        .from('arus_kas')
        .select('jumlah, jenis_transaksi')
        .is('deleted_at', null)
        .gte('tanggal_transaksi', fromDate)
        .lte('tanggal_transaksi', toDate),

      // Contribution payments
      supabase
        .from('pembayaran_sumbangan')
        .select('jumlah, status')
        .is('deleted_at', null)
        .gte('tanggal_pembayaran', fromDate)
        .lte('tanggal_pembayaran', toDate),

      // Period reports
      supabase
        .from('laporan_periode')
        .select('*')
        .is('deleted_at', null)
        .gte('tanggal_mulai', fromDate)
        .lte('tanggal_mulai', toDate),

      // Death benefit funds
      supabase
        .from('dana_kematian')
        .select('total_dana, total_dibayar')
        .is('deleted_at', null)
        .single(),

      // Social funds
      supabase
        .from('dana_sosial')
        .select('total_dana, total_dibayar')
        .is('deleted_at', null)
        .single(),

      // Active members count
      supabase
        .from('anggota')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status_keanggotaan', 'aktif'),
    ]);

    // Calculate cash flow statistics
    const kasMasuk = arusKasResult.data
      ?.filter(item => item.jenis_transaksi === 'masuk')
      .reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;

    const kasKeluar = arusKasResult.data
      ?.filter(item => item.jenis_transaksi === 'keluar')
      .reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;

    const netCashFlow = kasMasuk - kasKeluar;

    // Calculate contribution payment statistics
    const totalTerbayar = pembayaranSumbanganResult.data
      ?.filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;

    const totalTertunda = pembayaranSumbanganResult.data
      ?.filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;

    const jumlahTransaksi = pembayaranSumbanganResult.data?.length || 0;

    // Calculate income statement data
    const totalPendapatan = laporanPeriodeResult.data
      ?.reduce((sum, item) => sum + (item.total_pemasukan || 0), 0) || 0;

    const totalBeban = laporanPeriodeResult.data
      ?.reduce((sum, item) => sum + (item.total_pengeluaran || 0), 0) || 0;

    const labaBersih = totalPendapatan - totalBeban;

    // Calculate balance sheet data
    const totalAset = laporanPeriodeResult.data
      ?.reduce((sum, item) => sum + (item.total_aset || 0), 0) || 0;

    const totalKewajiban = laporanPeriodeResult.data
      ?.reduce((sum, item) => sum + (item.total_kewajiban || 0), 0) || 0;

    const totalEkuitas = laporanPeriodeResult.data
      ?.reduce((sum, item) => sum + (item.total_ekuitas || 0), 0) || 0;

    // Get death benefit fund data
    const totalDanaKematian = danaKematianResult.data?.total_dana || 0;
    const klaimKematianDibayar = danaKematianResult.data?.total_dibayar || 0;
    const sisaDanaKematian = totalDanaKematian - klaimKematianDibayar;

    // Get social fund data
    const totalDanaSosial = danaSosialResult.data?.total_dana || 0;
    const bantuanDiberikan = danaSosialResult.data?.total_dibayar || 0;
    const sisaDanaSosial = totalDanaSosial - bantuanDiberikan;

    // Count period reports by status
    const totalReports = laporanPeriodeResult.data?.length || 0;
    const pendingReports = laporanPeriodeResult.data
      ?.filter(item => item.status_laporan === 'draft').length || 0;

    // Active members count
    const anggotaAktif = anggotaResult.count || 0;

    // Calculate total funds (death + social)
    const totalDana = totalDanaKematian + totalDanaSosial;

    return NextResponse.json({
      overview: {
        totalAset,
        totalDana,
        anggotaAktif,
        totalReports,
        pendingReports,
      },
      ringkasanKeuangan: {
        totalPemasukan: kasMasuk,
        totalPengeluaran: kasKeluar,
        saldo: netCashFlow,
      },
      arusKas: {
        kasMasuk,
        kasKeluar,
        netCashFlow,
      },
      labaRugi: {
        pendapatan: totalPendapatan,
        beban: totalBeban,
        labaBersih,
      },
      neraca: {
        totalAset,
        totalKewajiban,
        totalEkuitas,
      },
      pembayaranSumbangan: {
        totalTerbayar,
        totalTertunda,
        jumlahTransaksi,
      },
      danaKematian: {
        totalDana: totalDanaKematian,
        klaimDibayar: klaimKematianDibayar,
        sisaDana: sisaDanaKematian,
      },
      danaSosial: {
        totalDana: totalDanaSosial,
        bantuanDiberikan,
        sisaDana: sisaDanaSosial,
      },
      laporanPeriode: {
        totalReports,
        pendingReports,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/keuangan/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
