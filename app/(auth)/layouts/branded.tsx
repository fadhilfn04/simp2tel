import { ReactNode } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-2.png')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-2-dark.png')}');
          }
        `}
      </style>
      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-6 lg:p-10 order-2 lg:order-1 bg-gray-50/50">
          <div className="w-full max-w-[450px]">
            {/* Logo and Welcome */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <img
                  src={toAbsoluteUrl('/media/app/logo-p2tel.png')}
                  className="h-8 max-w-none mx-auto"
                  alt="Sistem Informasi Persatuan Pensiunan Telkom"
                />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Sistem Informasi</h1>
              <p className="text-sm text-gray-600">Persatuan Pensiunan Telkom</p>
              <p className="text-gray-500 text-xs mt-4">
                Selamat datang di portal resmi pensiunan Telkom
              </p>
            </div>

            {/* Auth Card */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                {children}
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Butuh bantuan? Hubungi admin di 021-12345678</p>
            </div>
          </div>
        </div>

        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-col justify-between h-full p-8 lg:p-16 min-h-[500px]">
            {/* Top Section */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 text-sm font-medium">Portal Aktif</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    Portal Pensiunan
                    <br />
                    <span className="text-blue-600">Telkom Indonesia</span>
                  </h2>
                  <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
                  Akses mudah informasi keanggotaan, keuangan,
                  dan komunitas pensiunan Telkom di satu platform terintegrasi.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">👥</div>
                    <h3 className="text-gray-900 font-semibold text-sm mb-1">Keanggotaan</h3>
                    <p className="text-gray-600 text-xs">Kelola data keanggotaan</p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">💊</div>
                    <h3 className="text-gray-900 font-semibold text-sm mb-1">Pelayanan</h3>
                    <p className="text-gray-600 text-xs">Layanan dana kematian & dana sosial</p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="text-gray-900 font-semibold text-sm mb-1">Keuangan</h3>
                    <p className="text-gray-600 text-xs">Info iuran & manfaat</p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">🤝</div>
                    <h3 className="text-gray-900 font-semibold text-sm mb-1">Surat Elektronik</h3>
                    <p className="text-gray-600 text-xs">Kegiatan & forum</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto pt-8 border-t border-white/30">
              <div className="flex items-center gap-4 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@pensiunan.telkom.co.id</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
