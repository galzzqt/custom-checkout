'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutErrorPage() {
  const router = useRouter();
  const [errorData, setErrorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get error data from URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const transactionStatus = urlParams.get('transaction_status');
      const errorMessage = urlParams.get('error_message');
      
      setErrorData({
        orderId: orderId,
        status: transactionStatus || 'error',
        message: errorMessage || 'Pembayaran gagal diproses',
        date: new Date().toLocaleDateString('id-ID')
      });
    }
    setLoading(false);
  }, []);

  const handleRetryPayment = () => {
    // Redirect back to cart to retry payment
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h1>
            <p className="text-gray-600 mb-6">
              Maaf, terjadi kesalahan saat memproses pembayaran Anda.
            </p>

            {errorData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h2 className="text-lg font-semibold text-red-900 mb-3">Detail Error</h2>
                <dl className="space-y-2">
                  {errorData.orderId && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-red-700">Nomor Pesanan:</dt>
                      <dd className="text-sm text-red-900 font-medium">{errorData.orderId}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-red-700">Status:</dt>
                    <dd className="text-sm text-red-600 font-medium">
                      {errorData.status === 'error' ? 'Gagal' : errorData.status}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-red-700">Tanggal:</dt>
                    <dd className="text-sm text-red-900">{errorData.date}</dd>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <dt className="text-sm font-medium text-red-700">Pesan Error:</dt>
                    <dd className="text-sm text-red-900 mt-1">{errorData.message}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Coba Lagi
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-white text-gray-700 py-3 px-4 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Kembali ke Beranda
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Solusi yang Mungkin</h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Periksa koneksi internet Anda</li>
                <li>• Pastikan saldo kartu kredit/debit mencukupi</li>
                <li>• Verifikasi informasi pembayaran yang dimasukkan</li>
                <li>• Coba metode pembayaran lain</li>
                <li>• Hubungi bank Anda jika masalah berlanjut</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-gray-600 mb-2">
                Jika Anda terus mengalami masalah, jangan ragu untuk menghubungi tim dukungan kami.
              </p>
              <div className="space-y-1">
                <a href="mailto:support@example.com" className="text-xs text-indigo-600 hover:text-indigo-800">
                  📧 support@example.com
                </a>
                <br />
                <a href="tel:+628123456789" className="text-xs text-indigo-600 hover:text-indigo-800">
                  📞 +62 812-3456-789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
