# WordPress Setup Guide - Custom Checkout Integration

## 📋 **Langkah 1: Install Plugin**

### **Cara 1: Manual Upload**
1. Download file `wordpress-integration.php`
2. Login ke WordPress Admin
3. Go to **Plugins → Add New → Upload Plugin**
4. Upload file `wordpress-integration.php`
5. Activate plugin

### **Cara 2: FTP Upload**
1. Connect ke server via FTP
2. Navigate ke `/wp-content/plugins/`
3. Buat folder baru: `nextjs-checkout`
4. Upload `wordpress-integration.php` ke folder tersebut
5. Login ke WordPress Admin → Activate plugin

## 📋 **Langkah 2: Konfigurasi Plugin**

### **Update URL Custom Checkout**
Plugin sudah di-update dengan URL:
```
https://custom-checkout-kvdp75iyw-galzzqts-projects.vercel.app
```

### **Verifikasi Setup**
1. Go to **WooCommerce → Settings → Checkout**
2. Pastikan **"Enable guest checkout"** dicentang
3. Go to **Products → All Products**
4. Test dengan klik salah satu produk

## 📋 **Langkah 3: Testing Integration**

### **Test 1: Product Page**
1. Buka halaman produk di WordPress
2. Harus ada button **"Beli Sekarang"**
3. Klik button → harus redirect ke custom checkout

### **Test 2: Cart Page**
1. Add product ke cart
2. Go to cart page
3. Harus ada button **"Checkout Aman dengan Next.js"**

### **Test 3: Complete Flow**
1. Add product → cart → checkout
2. Isi form → pilih payment → complete
3. Order harus muncul di WooCommerce admin

## 📋 **Langkah 4: Customization (Optional)**

### **Update Button Text**
Edit file `wordpress-integration.php`:
```php
// Ganti text button
echo '<button type="button" class="button alt custom-checkout-btn">
        <i class="fas fa-credit-card"></i> Checkout Custom
      </button>';
```

### **Update Redirect Logic**
```php
// Custom redirect conditions
if (is_checkout() && !is_wc_endpoint_url()) {
    // Custom logic here
    wp_redirect($this->nextjs_checkout_url . '/cart');
    exit;
}
```

## 📋 **Langkah 5: Troubleshooting**

### **Issue 1: Button tidak muncul**
- Pastikan plugin sudah aktif
- Check WooCommerce settings
- Clear cache WordPress

### **Issue 2: Redirect tidak bekerja**
- Check URL di plugin
- Pastikan tidak ada plugin conflict
- Test di incognito mode

### **Issue 3: Cart tidak sync**
- Check environment variables di Vercel
- Test API endpoint `/api/sync-cart`
- Check CORS settings

## 📋 **Langkah 6: Advanced Setup**

### **Custom CSS untuk Button**
Tambahkan di `functions.php` theme:
```php
function custom_checkout_button_styles() {
    ?>
    <style>
        .custom-checkout-btn {
            background: #0073aa !important;
            color: white !important;
            padding: 15px 30px !important;
            border: none !important;
            border-radius: 4px !important;
            text-decoration: none !important;
            display: inline-block !important;
            font-weight: bold !important;
        }
        .custom-checkout-btn:hover {
            background: #005a87 !important;
        }
    </style>
    <?php
}
add_action('wp_head', 'custom_checkout_button_styles');
```

### **Custom Redirect Logic**
```php
// Redirect hanya untuk user tertentu
function custom_redirect_condition() {
    if (is_checkout() && current_user_can('customer')) {
        // Hanya untuk logged-in users
        return 'https://custom-checkout-kvdp75iyw-galzzqts-projects.vercel.app/cart';
    }
    return wc_get_checkout_url();
}
add_filter('woocommerce_get_checkout_url', 'custom_redirect_condition');
```

## 📋 **Langkah 7: Monitoring**

### **Check Order Flow**
1. Test order dari WordPress → Custom checkout
2. Check order di WooCommerce admin
3. Verify payment status update
4. Test email notifications

### **Debug Mode**
Tambahkan di plugin untuk debugging:
```php
// Debug mode
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('Next.js Checkout Debug: ' . print_r($_SERVER, true));
}
```

## 🎯 **Final Verification Checklist**

- [ ] Plugin installed dan aktif
- [ ] URL custom checkout sudah benar
- [ ] Button muncul di product page
- [ ] Button muncul di cart page
- [ ] Redirect bekerja dengan benar
- [ ] Cart sync berfungsi
- [ ] Order tercatat di WooCommerce
- [ ] Payment status update berjalan
- [ ] Email notifications terkirim

## 📞 **Support**

Jika ada masalah:
1. Check WordPress error logs
2. Test API endpoints manual
3. Verify Vercel environment variables
4. Test dengan different browsers
