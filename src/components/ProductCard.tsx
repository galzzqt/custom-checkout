'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

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

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const router = useRouter();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking add to cart
        addToCart({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.images[0]?.src || '',
        });
    };

    return (
        <div className="group">
            <div
                className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8 cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}
            >
                {product.images && product.images[0]?.src ? (
                    <img
                        src={product.images[0].src}
                        alt={product.name}
                        className="w-full h-full object-center object-cover group-hover:opacity-75"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                    </div>
                )}
            </div>
            <h3
                className="mt-4 text-sm text-gray-700 cursor-pointer hover:text-indigo-600"
                onClick={() => router.push(`/product/${product.slug}`)}
            >
                {product.name}
            </h3>
            <div className="mt-1 flex justify-between items-center">
                <div>
                    {product.sale_price ? (
                        <>
                            <p className="text-lg font-medium text-red-600">${product.sale_price}</p>
                            <p className="text-sm text-gray-500 line-through">${product.regular_price}</p>
                        </>
                    ) : (
                        <p className="text-lg font-medium text-gray-900">${product.price}</p>
                    )}
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
