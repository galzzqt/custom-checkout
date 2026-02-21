'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPendingPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(300); // 5 menit countdown

  useEffect(() => {
    // Get order data from URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const transactionStatus = urlParams.get('transaction_status');
      const paymentType = urlParams.get('payment_type');
      
      setOrderData({
        orderId: orderId,
        status: transactionStatus || 'pending',
        paymentType: paymentType || 'transfer',
        date: new Date().toLocaleDateString('id-ID'),
        time: new Date().toLocaleTimeString('id-ID')
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCheckStatus = () => {
    // Redirect to success page or check payment status
    router.push('/checkout/success');
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-8 w-8 text-yellow-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menunggu Pembayaran</h1>
            <p className="text-gray-600 mb-6">
              Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran untuk mengkonfirmasi pesanan.
            </p>

            {orderData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h2 className="text-lg font-semibold text-yellow-900 mb-3">Detail Pesanan</h2>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-yellow-700">Nomor Pesanan:</dt>
                    <dd className="text-sm text-yellow-900 font-medium">{orderData.orderId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-yellow-700">Status:</dt>
                    <dd className="text-sm text-yellow-600 font-medium">Menunggu Pembayaran</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-yellow-700">Metode Pembayaran:</dt>
                    <dd className="text-sm text-yellow-900 capitalize">{orderData.paymentType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-yellow-700">Tanggal:</dt>
                    <dd className="text-sm text-yellow-900">{orderData.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-yellow-700">Waktu:</dt>
                    <dd className="text-sm text-yellow-900">{orderData.time}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Countdown Timer */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Batas Waktu Pembayaran</h3>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(countdown)}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Sisa waktu untuk menyelesaikan pembayaran
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckStatus}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cek Status Pembayaran
              </button>
              
              <button
                onClick={() => router.push('/cart')}
                className="w-full bg-white text-gray-700 py-3 px-4 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Kembali ke Keranjang
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Instruksi Pembayaran</h3>
              <div className="text-xs text-gray-600 space-y-2">
                {orderData?.paymentType === 'bank_transfer' && (
                  <>
                    <p className="font-medium">Transfer Bank:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka aplikasi mobile banking atau internet banking</li>
                      <li>Pilih menu transfer ke rekening bank</li>
                      <li>Masukkan nomor rekening tujuan</li>
                      <li>Masukkan jumlah pembayaran yang sesuai</li>
                      <li>Konfirmasi pembayaran</li>
                    </ol>
                  </>
                )}
                {orderData?.paymentType === 'credit_card' && (
                  <>
                    <p className="font-medium">Kartu Kredit:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Masukkan nomor kartu kredit</li>
                      <li>Masukkan tanggal kadaluarsa</li>
                      <li>Masukkan CVV</li>
                      <li>Ikuti proses verifikasi 3D Secure</li>
                    </ol>
                  </>
                )}
                {orderData?.paymentType === 'echannel' && (
                  <>
                    <p className="font-medium">Mandiri Virtual Account:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka aplikasi Mandiri Online</li>
                      <li>Pilih menu Pembayaran</li>
                      <li>Pilih Multi Payment</li>
                      <li>Masukkan kode perusahaan</li>
                      <li>Masukkan nomor virtual account</li>
                    </ol>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Penting!</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Pembayaran akan otomatis dikonfirmasi setelah berhasil</li>
                <li>• Simpan bukti pembayaran sebagai arsip</li>
                <li>• Pesanan akan dibatalkan jika pembayaran tidak selesai dalam waktu yang ditentukan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
