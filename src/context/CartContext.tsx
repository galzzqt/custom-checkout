// src/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  weight?: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
  syncFromWordPress: (cartData: any) => void;
  isSyncing: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cart from localStorage on client-side
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('woo-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check for WordPress sync data in URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);

      // Format 1: ?cart=[json array] — dikirim langsung dari filter WordPress
      const cartData = urlParams.get('cart');
      if (cartData) {
        try {
          const parsedItems = JSON.parse(decodeURIComponent(cartData));
          if (Array.isArray(parsedItems)) {
            syncFromWordPress({ items: parsedItems });
          }
          // Hapus query string dari URL agar terlihat bersih
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch (error) {
          console.error('Failed to parse ?cart= data:', error);
        }
        return; // Sudah dapat data, tidak perlu cek ?sync=
      }

      // Format 2: ?sync=[base64] — format lama
      const syncData = urlParams.get('sync');
      if (syncData) {
        try {
          const parsedData = JSON.parse(atob(syncData));
          syncFromWordPress(parsedData);
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch (error) {
          console.error('Failed to parse sync data:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('woo-cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Sync cart data from WordPress
  const syncFromWordPress = (cartData: any) => {
    setIsSyncing(true);
    try {
      if (cartData.items && Array.isArray(cartData.items)) {
        const syncedCart: CartItem[] = cartData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity || 1,
          image: item.image || '',
          sku: item.sku || '',
          weight: item.weight ? parseFloat(item.weight) : undefined,
        }));

        setCart(syncedCart);
        console.log('Cart synced from WordPress:', syncedCart);
      }
    } catch (error) {
      console.error('Error syncing cart from WordPress:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync with WordPress on mount
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      // Try to sync with WordPress if user came from WordPress site
      const referrer = document.referrer;
      if (referrer && referrer.includes('1001autocare.com')) {
        syncWithWordPress();
      }
    }
  }, [isMounted]);

  const syncWithWordPress = async () => {
    try {
      const response = await fetch('https://1001autocare.com/wp-json/nextjs-checkout/v1/cart');
      if (response.ok) {
        const cartData = await response.json();
        syncFromWordPress(cartData);
      }
    } catch (error) {
      console.error('Failed to sync with WordPress:', error);
    }
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartTotal,
        syncFromWordPress,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}