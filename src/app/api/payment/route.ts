// src/app/api/payment/route.ts
import { NextResponse } from 'next/server';
import * as midtrans from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const { orderDetails, customerDetails } = await request.json();

    const snap = new midtrans.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    });

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        gross_amount: orderDetails.amount,
      },
      credit_card: {
        secure: true,
        save_card: false
      },
      item_details: orderDetails.items.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: {
          first_name: customerDetails.firstName,
          last_name: customerDetails.lastName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
          country_code: 'IDN',
        }
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/error`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/pending`,
        notification: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/notification`,
      }
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json({
      error: error.message || 'Terjadi kesalahan saat memproses pembayaran'
    }, { status: 500 });
  }
}