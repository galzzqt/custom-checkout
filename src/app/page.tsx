
import { wooCommerceApi } from '@/lib/woocommerce';
import ProductCard from '@/components/ProductCard';
import CartIconButton from '@/components/CartIconButton';

// Define the Product type
type Product = {
  id: number;
  name: string;
  price: string;
  slug: string;
  images: Array<{ src: string }>;
  stock_quantity: number;
  regular_price: string;
  sale_price: string;
};

// Function to fetch products
async function getProducts(): Promise<Product[]> {
  try {
    const response = await wooCommerceApi.get('products', {
      params: {
        per_page: 20,
        status: 'publish',
        stock_status: 'instock',
      },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching products:', err);
    throw new Error('Failed to load products');
  }
}

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (err) {
    error = 'Failed to load products. Please try again later.';
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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
            <div className="mt-2">
              <a
                href="/products"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Lihat Semua Produk →
              </a>
            </div>
          </div>
          <CartIconButton />
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}