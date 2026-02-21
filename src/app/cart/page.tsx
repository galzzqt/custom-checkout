'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createOrder } from '@/lib/woocommerce';
import { useCart } from '@/context/CartContext';

const CheckoutSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address1: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  postcode: Yup.string().required('Postcode is required'),
  country: Yup.string().required('Country is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk membuat order di WooCommerce
  const createWooCommerceOrder = async (values: any, cartItems: typeof cart) => {
    const order = {
      payment_method: values.paymentMethod,
      payment_method_title:
        values.paymentMethod === 'cod' ? 'Cash on Delivery' :
          values.paymentMethod === 'bacs' ? 'Bank Transfer' :
            'Midtrans Payment',
      status: 'pending',
      customer_note: values.notes,
      billing: {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        address_1: values.address1,
        address_2: values.address2 || '',
        city: values.city,
        state: values.state,
        postcode: values.postcode,
        country: values.country,
      },
      shipping: {
        first_name: values.firstName,
        last_name: values.lastName,
        address_1: values.address1,
        address_2: values.address2 || '',
        city: values.city,
        state: values.state,
        postcode: values.postcode,
        country: values.country,
      },
      line_items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'Flat Rate',
          total: '0', // Gratis ongkir atau sesuaikan
        },
      ],
    };

    const data = await createOrder(order);
    return data;
  };

  const handleSubmit = async (values: any) => {
    if (cart.length === 0) {
      alert('Keranjang Anda kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      // Jika memilih Midtrans
      if (values.paymentMethod === 'midtrans') {
        try {
          // Kirim data ke API route untuk membuat transaksi Midtrans
          const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderDetails: {
                amount: cartTotal,
                items: cart.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity
                }))
              },
              customerDetails: {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone,
                address: values.address1,
                city: values.city,
                postalCode: values.postcode,
                country: values.country
              }
            }),
          });

          const { token } = await response.json();

          // Muat script Midtrans Snap
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
          script.async = true;
          script.onload = () => {
            // @ts-ignore
            window.snap.pay(token, {
              onSuccess: async function (result: any) {
                // Buat order di WooCommerce setelah pembayaran berhasil
                const order = await createWooCommerceOrder(values, cart);
                clearCart();
                router.push(`/checkout/success?order_id=${order.id}&transaction_status=success&gross_amount=${order.total}`);
              },
              onPending: function (result: any) {
                alert('Menunggu pembayaran Anda diproses');
              },
              onError: function (error: any) {
                console.error('Pembayaran gagal:', error);
                alert('Pembayaran gagal, silakan coba lagi');
                setIsSubmitting(false);
              },
              onClose: function () {
                console.log('Anda menutup popup tanpa menyelesaikan pembayaran');
                setIsSubmitting(false);
              }
            });
          };
          document.body.appendChild(script);

          return; // Keluar dari fungsi setelah menginisialisasi Midtrans

        } catch (error) {
          console.error('Error during Midtrans payment:', error);
          alert('Terjadi kesalahan saat memproses pembayaran');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Untuk metode pembayaran selain Midtrans (COD/Transfer Bank)
        const order = await createWooCommerceOrder(values, cart);
        clearCart();
        router.push(`/checkout/success?order_id=${order.id}&transaction_status=success&gross_amount=${order.total}`);
      }

    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-600 hover:text-red-800 mt-1 font-medium underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${cartTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <p>Shipping</p>
                      <p>$10.00</p>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                      <p>Total</p>
                      <p>${(cartTotal + 10).toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-lg p-6">
              <Formik
                initialValues={{
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  address1: '',
                  address2: '',
                  city: '',
                  state: '',
                  postcode: '',
                  country: 'Indonesia',
                  paymentMethod: '',
                  notes: '',
                }}
                validationSchema={CheckoutSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First name *
                          </label>
                          <Field
                            type="text"
                            id="firstName"
                            name="firstName"
                            className={`mt-1 block w-full border ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last name *
                          </label>
                          <Field
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={`mt-1 block w-full border ${errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address *
                          </label>
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            className={`mt-1 block w-full border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone *
                          </label>
                          <Field
                            type="tel"
                            id="phone"
                            name="phone"
                            autoComplete="tel"
                            className={`mt-1 block w-full border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                            Street address *
                          </label>
                          <Field
                            type="text"
                            id="address1"
                            name="address1"
                            className={`mt-1 block w-full border ${errors.address1 && touched.address1 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          />
                          <ErrorMessage name="address1" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                            Apartment, suite, etc. (optional)
                          </label>
                          <Field
                            type="text"
                            id="address2"
                            name="address2"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                          <div className="sm:col-span-1">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                              City *
                            </label>
                            <Field
                              type="text"
                              id="city"
                              name="city"
                              className={`mt-1 block w-full border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            />
                            <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div className="sm:col-span-1">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                              State/Province *
                            </label>
                            <Field
                              type="text"
                              id="state"
                              name="state"
                              className={`mt-1 block w-full border ${errors.state && touched.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            />
                            <ErrorMessage name="state" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div className="sm:col-span-1">
                            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                              ZIP/Postal code *
                            </label>
                            <Field
                              type="text"
                              id="postcode"
                              name="postcode"
                              className={`mt-1 block w-full border ${errors.postcode && touched.postcode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            />
                            <ErrorMessage name="postcode" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country *
                          </label>
                          <Field
                            as="select"
                            id="country"
                            name="country"
                            className={`mt-1 block w-full border ${errors.country && touched.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                          >
                            <option value="Indonesia">Indonesia</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Philippines">Philippines</option>
                          </Field>
                          <ErrorMessage name="country" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    <fieldset className="pt-6 border-t border-gray-200">
                      <legend className="text-lg font-medium text-gray-900">Metode Pembayaran</legend>
                      <div className="mt-4 space-y-4">
                        {/* Opsi Cash on Delivery */}
                        <div className="flex items-center">
                          <Field
                            id="cod"
                            name="paymentMethod"
                            type="radio"
                            value="cod"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                            Cash on Delivery
                          </label>
                        </div>
                        {/* Opsi Transfer Bank */}
                        <div className="flex items-center">
                          <Field
                            id="bank_transfer"
                            name="paymentMethod"
                            type="radio"
                            value="bacs"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="bank_transfer" className="ml-3 block text-sm font-medium text-gray-700">
                            Transfer Bank
                          </label>
                        </div>
                        {/* Opsi Midtrans */}
                        <div className="flex items-center">
                          <Field
                            id="midtrans"
                            name="paymentMethod"
                            type="radio"
                            value="midtrans"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="midtrans" className="ml-3 block text-sm font-medium text-gray-700">
                            Kartu Kredit/Transfer Bank (Midtrans)
                          </label>
                        </div>
                      </div>
                      <ErrorMessage name="paymentMethod" component="div" className="mt-1 text-sm text-red-600" />
                    </fieldset>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Order notes (optional)
                      </label>
                      <Field
                        as="textarea"
                        id="notes"
                        name="notes"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Notes about your order, e.g. special notes for delivery."
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
