import { NextResponse } from 'next/server';
import * as midtrans from 'midtrans-client';
import crypto from 'crypto';

// Midtrans notification handler
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const notification = JSON.parse(body);
    
    // Verify the notification signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    
    // Create signature string
    const signatureString = orderId + statusCode + grossAmount + serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(signatureString)
      .digest('hex');
    
    // Verify signature
    if (notification.signature_key !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process the notification based on transaction status
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    
    console.log('Midtrans notification received:', {
      orderId,
      transactionStatus,
      fraudStatus,
      paymentType: notification.payment_type,
      grossAmount
    });

    // Handle different transaction statuses
    switch (transactionStatus) {
      case 'capture':
        if (fraudStatus === 'challenge') {
          // Transaction is challenged by fraud detection
          console.log(`Order ${orderId} is challenged by fraud detection`);
          // You might want to update order status to 'on_hold'
        } else if (fraudStatus === 'accept') {
          // Transaction is successful
          console.log(`Order ${orderId} payment successful`);
          // Update order status to 'processing' or 'completed'
          await updateOrderStatus(orderId, 'processing');
        }
        break;
        
      case 'settlement':
        // Transaction is successful and settled
        console.log(`Order ${orderId} payment settled`);
        await updateOrderStatus(orderId, 'processing');
        break;
        
      case 'pending':
        // Transaction is pending
        console.log(`Order ${orderId} payment pending`);
        await updateOrderStatus(orderId, 'pending');
        break;
        
      case 'deny':
        // Transaction is denied
        console.log(`Order ${orderId} payment denied`);
        await updateOrderStatus(orderId, 'failed');
        break;
        
      case 'expire':
        // Transaction is expired
        console.log(`Order ${orderId} payment expired`);
        await updateOrderStatus(orderId, 'cancelled');
        break;
        
      case 'cancel':
        // Transaction is cancelled
        console.log(`Order ${orderId} payment cancelled`);
        await updateOrderStatus(orderId, 'cancelled');
        break;
        
      default:
        console.log(`Unknown transaction status: ${transactionStatus} for order ${orderId}`);
    }

    // Return success response to Midtrans
    return NextResponse.json({ status: 'ok' });
    
  } catch (error: any) {
    console.error('Error processing Midtrans notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update order status
async function updateOrderStatus(orderId: string, status: string) {
  try {
    // Extract WooCommerce order ID from Midtrans order ID
    // Assuming format: ORDER-{timestamp}-{random}-{wooOrderId}
    const parts = orderId.split('-');
    const wooOrderId = parts[parts.length - 1];
    
    // Update WooCommerce order status
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/wp-json/wc/v3/orders/${wooOrderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        status: status === 'processing' ? 'processing' : 
               status === 'pending' ? 'pending' :
               status === 'failed' ? 'failed' :
               status === 'cancelled' ? 'cancelled' : 'pending'
      }),
    });

    if (!response.ok) {
      console.error('Failed to update WooCommerce order status:', await response.text());
    } else {
      console.log(`Successfully updated order ${wooOrderId} status to ${status}`);
    }
    
    // You can also:
    // 1. Send email notifications to customer
    // 2. Update inventory
    // 3. Trigger other business logic
    // 4. Log the transaction for analytics
    
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}
