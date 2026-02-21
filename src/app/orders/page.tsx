'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Order = {
  id: number;
  date_created: string;
  status: string;
  total: string;
  payment_method: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: string;
    total: string;
  }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // In a real app, you would fetch orders based on logged-in user
      // For now, we'll fetch all orders (you should filter by customer ID)
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/wc/v3/orders`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOOCOMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.reverse()); // Show newest orders first
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'refunded':
        return 'Dikembalikan';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(parseFloat(price));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Memuat pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <p className="mt-2 text-gray-600">Lihat status dan detail pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Anda belum memiliki pesanan. Mulai berbelanja sekarang!
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mulai Belanja
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Pesanan #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.date_created)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Detail Pesanan</h4>
                    <div className="space-y-2">
                      {order.line_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Pembayaran</h4>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Metode:</dt>
                          <dd className="text-sm text-gray-900 capitalize">{order.payment_method}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Total:</dt>
                          <dd className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Pengiriman</h4>
                      <dl className="space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">Nama:</dt>
                          <dd className="text-sm text-gray-900">
                            {order.billing.first_name} {order.billing.last_name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Email:</dt>
                          <dd className="text-sm text-gray-900">{order.billing.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Telepon:</dt>
                          <dd className="text-sm text-gray-900">{order.billing.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => router.push('/cart')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Lanjutkan Pembayaran
                      </button>
                    )}
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
