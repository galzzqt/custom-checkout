'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { wooCommerceApi } from '@/lib/woocommerce';
import ProductImage from '@/components/ProductImage';

type Product = {
  id: number;
  name: string;
  price: string;
  slug: string;
  images: Array<{ src: string }>;
  stock_quantity: number;
  regular_price: string;
  sale_price: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  average_rating: string;
  rating_count: number;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const { addToCart, itemCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let params: any = {
        per_page: 50,
        status: 'publish',
        stock_status: 'instock',
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (sortBy === 'price_low') {
        params.orderby = 'price';
        params.order = 'asc';
      } else if (sortBy === 'price_high') {
        params.orderby = 'price';
        params.order = 'desc';
      } else if (sortBy === 'rating') {
        params.orderby = 'rating';
        params.order = 'desc';
      } else if (sortBy === 'popularity') {
        params.orderby = 'popularity';
        params.order = 'desc';
      } else if (sortBy === 'date') {
        params.orderby = 'date';
        params.order = 'desc';
      }

      const response = await wooCommerceApi.get('products', params);
      
      // Filter by price range
      let filteredProducts = response.data.filter((product: Product) => {
        const price = parseFloat(product.sale_price || product.price);
        return price >= priceRange.min && price <= priceRange.max;
      });

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await wooCommerceApi.get('products/categories', {
        hide_empty: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price),
      image: product.images[0]?.src || '',
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(parseFloat(price));
  };

  const renderStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    return (
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 flex-shrink-0 ${
              ratingNum > star ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Semua Produk</h1>
          <button
            onClick={() => router.push('/cart')}
            className="relative p-2 text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Produk
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Kategori</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Semua Kategori</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.slug}
                        checked={selectedCategory === category.slug}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="default">Default</option>
                  <option value="popularity">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="date">Terbaru</option>
                  <option value="price_low">Harga Terendah</option>
                  <option value="price_high">Harga Tertinggi</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Rentang Harga</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000000 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Coba kata kunci pencarian lain' : 'Produk tidak tersedia saat ini'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Menampilkan {products.length} produk
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/product/${product.slug}`)}
                      >
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                          <ProductImage
                            src={product.images[0]?.src || ''}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600 mb-2"
                          onClick={() => router.push(`/product/${product.slug}`)}
                        >
                          {product.name}
                        </h3>
                        
                        {/* Categories */}
                        {product.categories.length > 0 && (
                          <div className="mb-2">
                            {product.categories.slice(0, 2).map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-1 mb-1"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Rating */}
                        {product.rating_count > 0 && (
                          <div className="mb-2">
                            {renderStars(product.average_rating)}
                          </div>
                        )}

                        <div className="flex justify-between items-center mb-3">
                          <div>
                            {product.sale_price ? (
                              <>
                                <p className="text-lg font-bold text-red-600">
                                  {formatPrice(product.sale_price)}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.regular_price)}
                                </p>
                              </>
                            ) : (
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
