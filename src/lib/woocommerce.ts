import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export const wooCommerceApi = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || '',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '',
  version: 'wc/v3',
  queryStringAuth: true,
  axiosConfig: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
});

export const getProducts = async () => {
  try {
    const { data } = await wooCommerceApi.get('products');
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const { data } = await wooCommerceApi.post('orders', orderData);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
