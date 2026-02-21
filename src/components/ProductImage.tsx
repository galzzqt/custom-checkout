'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  width = 600, 
  height = 600, 
  className = '',
  priority = false 
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg 
            className="h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <svg 
              className="h-12 w-12 text-gray-400 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Gambar tidak tersedia</p>
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-center object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}
