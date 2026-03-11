'use client';

import { Fragment, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/toolbar';
import { Container } from '@/components/common/container';
import Link from 'next/link';
import { ChevronRight, TrendingUp, DollarSign, FileText, PiggyBank, Heart, Users, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardKeuangan } from '@/lib/hooks/use-dashboard-keuangan-api';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  yellow: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
};

export default function LaporanKeuanganPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useDashboardKeuangan({
    period: selectedPeriod,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Build report categories with dynamic stats
  const reportCategories = dashboardData ? [
    {
      title: 'Ringkasan Keuangan',
      description: 'Ikhtisar kondisi keuangan organisasi secara real-time',
      icon: BarChart3,
      href: '/keuangan/laporan-keuangan/ringkasan',
      color: 'blue' as const,
      stats: [
        { label: 'Total Pemasukan', value: formatCurrency(dashboardData.ringkasanKeuangan.totalPemasukan) },
        { label: 'Total Pengeluaran', value: formatCurrency(dashboardData.ringkasanKeuangan.totalPengeluaran) },
        { label: 'Saldo', value: formatCurrency(dashboardData.ringkasanKeuangan.saldo) },
      ],
    },
    {
      title: 'Arus Kas',
      description: 'Laporan aliran masuk dan keluarnya uang',
      icon: TrendingUp,
      href: '/keuangan/laporan-keuangan/arus-kas',
      color: 'green' as const,
      stats: [
        { label: 'Kas Masuk', value: formatCurrency(dashboardData.arusKas.kasMasuk) },
        { label: 'Kas Keluar', value: formatCurrency(dashboardData.arusKas.kasKeluar) },
        { label: 'Net Cash Flow', value: formatCurrency(dashboardData.arusKas.netCashFlow) },
      ],
    },
    {
      title: 'Laba Rugi',
      description: 'Laporan pendapatan dan beban operasional',
      icon: FileText,
      href: '/keuangan/laporan-keuangan/laba-rugi',
      color: 'purple' as const,
      stats: [
        { label: 'Pendapatan', value: formatCurrency(dashboardData.labaRugi.pendapatan) },
        { label: 'Beban', value: formatCurrency(dashboardData.labaRugi.beban) },
        { label: 'Laba Bersih', value: formatCurrency(dashboardData.labaRugi.labaBersih) },
      ],
    },
    {
      title: 'Neraca',
      description: 'Laporan posisi keuangan dan ekuitas',
      icon: DollarSign,
      href: '/keuangan/laporan-keuangan/neraca',
      color: 'yellow' as const,
      stats: [
        { label: 'Total Aset', value: formatCurrency(dashboardData.neraca.totalAset) },
        { label: 'Total Kewajiban', value: formatCurrency(dashboardData.neraca.totalKewajiban) },
        { label: 'Ekuitas', value: formatCurrency(dashboardData.neraca.totalEkuitas) },
      ],
    },
    {
      title: 'Pembayaran Sumbangan',
      description: 'Pembayaran sumbangan anggota',
      icon: DollarSign,
      href: '/keuangan/laporan-keuangan/pembayaran-sumbangan',
      color: 'emerald' as const,
      stats: [
        { label: 'Total Terbayar', value: formatCurrency(dashboardData.pembayaranSumbangan.totalTerbayar) },
        { label: 'Tertunda', value: formatCurrency(dashboardData.pembayaranSumbangan.totalTertunda) },
        { label: 'Jumlah Transaksi', value: formatNumber(dashboardData.pembayaranSumbangan.jumlahTransaksi) },
      ],
    },
    {
      title: 'Dana Kematian',
      description: 'Laporan dana kematian anggota',
      icon: PiggyBank,
      href: '/keuangan/laporan-keuangan/dana-kematian',
      color: 'rose' as const,
      stats: [
        { label: 'Total Dana', value: formatCurrency(dashboardData.danaKematian.totalDana) },
        { label: 'Klaim Dibayar', value: formatCurrency(dashboardData.danaKematian.klaimDibayar) },
        { label: 'Sisa Dana', value: formatCurrency(dashboardData.danaKematian.sisaDana) },
      ],
    },
    {
      title: 'Dana Sosial',
      description: 'Laporan dana sosial dan bantuan',
      icon: Heart,
      href: '/keuangan/laporan-keuangan/dana-sosial',
      color: 'pink' as const,
      stats: [
        { label: 'Total Dana', value: formatCurrency(dashboardData.danaSosial.totalDana) },
        { label: 'Bantuan Diberikan', value: formatCurrency(dashboardData.danaSosial.bantuanDiberikan) },
        { label: 'Sisa Dana', value: formatCurrency(dashboardData.danaSosial.sisaDana) },
      ],
    },
    {
      title: 'Laporan Periode',
      description: 'Laporan harian, bulanan, dan tahunan',
      icon: Calendar,
      href: '/keuangan/laporan-keuangan/laporan-periode',
      color: 'indigo' as const,
      stats: [
        { label: 'Total Laporan', value: formatNumber(dashboardData.laporanPeriode.totalReports) },
        { label: 'Pending', value: formatNumber(dashboardData.laporanPeriode.pendingReports) },
        { label: 'Status', value: dashboardData.laporanPeriode.pendingReports > 0 ? 'Ada Pending' : 'Selesai' },
      ],
    },
  ] : [];

  // Quick stats for overview cards
  const quickStats = dashboardData ? [
    {
      label: 'Total Aset',
      value: formatCurrency(dashboardData.overview.totalAset),
      trend: '+15% dari bulan lalu',
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Total Dana',
      value: formatCurrency(dashboardData.overview.totalDana),
      trend: '+8% dari bulan lalu',
      icon: PiggyBank,
      color: 'green',
    },
    {
      label: 'Anggota Aktif',
      value: formatNumber(dashboardData.overview.anggotaAktif),
      trend: 'Member aktif',
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Laporan Periode Ini',
      value: formatNumber(dashboardData.overview.totalReports),
      trend: `${dashboardData.overview.pendingReports} pending review`,
      icon: FileText,
      color: 'yellow',
    },
  ] : [];
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Laporan Keuangan"
            description="Pusat Laporan Keuangan Organisasi"
          />
          <ToolbarActions>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          {/* Period Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Periode:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'today' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('today')}
                  >
                    Hari Ini
                  </Button>
                  <Button
                    variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('week')}
                  >
                    Minggu Ini
                  </Button>
                  <Button
                    variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                  >
                    Bulan Ini
                  </Button>
                  <Button
                    variant={selectedPeriod === 'year' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('year')}
                  >
                    Tahun Ini
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                  <p className="text-muted-foreground">Memuat data keuangan...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const colorClass = colorClasses[stat.color as keyof typeof colorClasses];

                  return (
                    <Card key={idx}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                          </div>
                          <div className={`p-3 ${colorClass} rounded-lg`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Report Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {reportCategories.map((category) => {
              const Icon = category.icon;
              const colorClass = colorClasses[category.color as keyof typeof colorClasses];

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className="group"
                >
                  <Card className="transition-all hover:shadow-lg hover:border-primary/50 h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                              {category.title}
                            </h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {category.description}
                          </p>
                          <div className="space-y-1.5">
                            {category.stats.map((stat, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{stat.label}</span>
                                <span className="font-medium">{stat.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
            </>
          )}
        </div>
      </Container>
    </Fragment>
  );
}
