# Panduan Integrasi Next.js Checkout dengan WordPress

## 🎯 Opsi 1: Subdomain (Recommended)

### Langkah 1: Deploy Next.js ke Vercel/Netlify
1. Push kode ke GitHub
2. Deploy ke Vercel:
   ```bash
   npm i -g vercel
   vercel --prod
   ```
3. Set custom domain di Vercel dashboard: `checkout.oudesouls.com`

### Langkah 2: Konfigurasi DNS di WordPress Hosting
Tambahkan CNAME record di DNS:
```
checkout.oudesouls.com -> cname.vercel-dns.com
```

### Langkah 3: Integrasi dengan WordPress
#### Metode A: Redirect WooCommerce Checkout
Tambahkan kode di `functions.php` theme WordPress:

```php
// Redirect WooCommerce checkout ke Next.js
function redirect_to_custom_checkout() {
    if (is_checkout() && !is_wc_endpoint_url()) {
        wp_redirect('https://checkout.oudesouls.com/cart');
        exit;
    }
}
add_action('template_redirect', 'redirect_to_custom_checkout');
```

#### Metode B: Custom Button di Product Page
Tambahkan custom "Beli Sekarang" button:

```php
// Tambahkan custom button di halaman produk
add_action('woocommerce_after_add_to_cart_button', 'add_custom_checkout_button');
function add_custom_checkout_button() {
    global $product;
    echo '<button type="button" class="button custom-checkout-btn" 
            onclick="window.location.href=\'https://checkout.oudesouls.com/cart?product_id=' . $product->get_id() . '\'">
            Beli Sekarang
          </button>';
}
```

## 🎯 Opsi 2: Same Domain dengan Path Structure

### Langkah 1: Konfigurasi Server
Gunakan Nginx reverse configuration:

```nginx
server {
    listen 443 ssl;
    server_name oudesouls.com;
    
    # WordPress (default)
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    # Next.js Checkout
    location /checkout {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Langkah 2: Update Next.js Base URL
Di `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  basePath: '/checkout',
  assetPrefix: '/checkout',
  images: {
    // ... config yang sudah ada
  },
};
```

## 🎯 Opsi 3: Embedded Iframe

### Langkah 1: Buat Halaman Custom di WordPress
Buat page baru dengan slug "custom-checkout"

### Langkah 2: Embed Next.js Checkout
```html
<iframe 
    src="https://checkout.oudesouls.com/cart" 
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

## 🔄 Sinkronisasi Data

### 1. Produk Sync
Pastikan Next.js menggunakan WooCommerce API yang sama:

```typescript
// src/lib/woocommerce.ts
const wooCommerceApi = new WooCommerceRestApi({
  url: 'https://oudesouls.com',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY!,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET!,
  version: 'wc/v3'
});
```

### 2. Cart Sync
Implement cart sharing antara WordPress dan Next.js:

```typescript
// Sync cart dari WordPress ke Next.js
const syncCartFromWordPress = async () => {
  // Ambil cart dari WordPress REST API
  const response = await fetch('https://oudesouls.com/wp-json/wc/v3/cart', {
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET}`
      ).toString('base64')}`
    }
  });
  
  const cartData = await response.json();
  // Update local cart state
  setCart(cartData);
};
```

### 3. Order Sync
Pastikan order dibuat di WooCommerce setelah pembayaran:

```typescript
// Di cart/page.tsx - setelah pembayaran Midtrans berhasil
const createWooCommerceOrder = async (values: any, cartItems: CartItem[]) => {
  const order = {
    payment_method: values.paymentMethod,
    payment_method_title: 'Midtrans Payment',
    status: 'pending',
    customer_note: values.notes,
    billing: {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone: values.phone,
      address_1: values.address1,
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
  };

  const response = await wooCommerceApi.post('orders', order);
  return response.data;
};
```

## 🔐 Keamanan

### 1. CORS Configuration
Tambahkan CORS headers di Next.js:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', 'https://oudesouls.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 2. Environment Variables
Pastikan environment variables sama di kedua platform:

```bash
# .env.local
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://oudesouls.com
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=your_key
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=your_secret
```

## 📱 Mobile App Integration

Jika Anda ingin mobile app:
1. Next.js checkout bisa diakses via mobile browser
2. Gunakan deep linking dari mobile app
3. Implement WebView untuk seamless experience

## 🚀 Rekomendasi

**Opsi 1 (Subdomain)** adalah yang paling direkomendasikan karena:
- ✅ Tidak mempengaruhi WordPress performance
- ✅ Mudah maintenance
- ✅ Bisa di-deploy independent
- ✅ SEO friendly
- ✅ Scalable

## 📞 Support

Jika butuh bantuan lebih lanjut:
1. Test di staging environment dulu
2. Monitor error logs
3. Backup WordPress sebelum implementasi
4. Test payment flow end-to-end
