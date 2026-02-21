'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from URL params or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const transactionStatus = urlParams.get('transaction_status');
      
      if (orderId) {
        // You can fetch order details from your API here
        setOrderData({
          orderId: orderId,
          status: transactionStatus || 'success',
          date: new Date().toLocaleDateString('id-ID'),
          total: urlParams.get('gross_amount') || '0'
        });
      }
    }
    setLoading(false);
  }, []);

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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-gray-600 mb-6">
              Terima kasih telah melakukan pembayaran. Pesanan Anda sedang diproses.
            </p>

            {orderData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Detail Pesanan</h2>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Nomor Pesanan:</dt>
                    <dd className="text-sm text-gray-900 font-medium">{orderData.orderId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Tanggal:</dt>
                    <dd className="text-sm text-gray-900">{orderData.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status:</dt>
                    <dd className="text-sm text-green-600 font-medium">
                      {orderData.status === 'success' ? 'Berhasil' : 'Diproses'}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Total Pembayaran:</dt>
                    <dd className="text-lg font-bold text-gray-900">
                      Rp {parseFloat(orderData.total).toLocaleString('id-ID')}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Kembali ke Beranda
              </button>
              
              <button
                onClick={() => router.push('/orders')}
                className="w-full bg-white text-indigo-600 py-3 px-4 rounded-md font-medium border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Lihat Riwayat Pesanan
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Informasi Penting</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Email konfirmasi telah dikirim ke alamat email Anda</li>
                <li>• Estimasi pengiriman 2-3 hari kerja</li>
                <li>• Anda dapat melacak status pesanan di halaman riwayat pesanan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
