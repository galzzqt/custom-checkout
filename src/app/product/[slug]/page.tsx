'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { wooCommerceApi } from '@/lib/woocommerce';
import ProductImage from '@/components/ProductImage';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  sku: string;
  stock_status: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string;
    name: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    visible: boolean;
    variation: boolean;
  }>;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await wooCommerceApi.get(`products?slug=${params.slug}`);
      if (response.data && response.data.length > 0) {
        const productData = await wooCommerceApi.get(`products/${response.data[0].id}`);
        setProduct(productData.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Tambahkan item ke keranjang quantity kali
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.images[0]?.src || '',
        });
      }
    }
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(parseFloat(price));
  };

  const getDiscountPercentage = () => {
    if (product?.sale_price && product?.regular_price) {
      const discount = ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h1>
          <a href="/" className="text-indigo-600 hover:text-indigo-800">
            Kembali ke beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Beranda
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <a href="/products" className="ml-4 text-gray-500 hover:text-gray-700">
                  Produk
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-gray-900 font-medium">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              {product.images[selectedImage] ? (
                <ProductImage
                  src={product.images[selectedImage].src}
                  alt={product.images[selectedImage].alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg border-2 ${
                      selectedImage === index ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    <ProductImage
                      src={image.src}
                      alt={image.alt || `${product.name} - Gambar ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>

            {/* Categories */}
            {product.categories.length > 0 && (
              <div className="mt-2">
                {product.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="mt-4">
              <div className="flex items-center">
                {product.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="ml-3 text-xl text-gray-500 line-through">
                      {formatPrice(product.regular_price)}
                    </span>
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {getDiscountPercentage()}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="mt-4 flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <svg
                      key={rating}
                      className={`h-5 w-5 flex-shrink-0 ${
                        parseFloat(product.average_rating) > rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.average_rating} ({product.rating_count} ulasan)
                </span>
              </div>
            )}

            {/* Stock Status */}
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.stock_status === 'instock'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_status === 'instock' ? 'Tersedia' : 'Stok Habis'}
              </span>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Deskripsi Singkat</h3>
                <div
                  className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </div>
            )}

            {/* Attributes */}
            {product.attributes.length > 0 && (
              <div className="mt-6 space-y-4">
                {product.attributes
                  .filter(attr => attr.visible && !attr.variation)
                  .map((attribute) => (
                    <div key={attribute.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {attribute.name}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {attribute.options.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAttributeChange(attribute.name, option)}
                            className={`px-3 py-2 text-sm border rounded-md ${
                              selectedAttributes[attribute.name] === option
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_status !== 'instock'}
                  className={`flex-1 bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {product.stock_status === 'instock' ? 'Tambah ke Keranjang' : 'Stok Habis'}
                </button>
              </div>
            </div>

            {/* Product Meta */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Informasi Produk</h3>
              <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                {product.sku && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">SKU</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Berat</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.weight} kg</dd>
                  </div>
                )}
                {product.dimensions.length && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dimensi</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.categories.map(cat => cat.name).join(', ')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deskripsi Produk</h2>
            <div
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
