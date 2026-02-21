<?php
/**
 * Plugin Name: Next.js Custom Checkout Integration
 * Description: Integrasi WooCommerce dengan Next.js custom checkout
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class NextJSCheckoutIntegration {
    
    private $nextjs_checkout_url = 'https://checkout.oudesouls.com';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Redirect WooCommerce checkout ke Next.js
        add_action('template_redirect', array($this, 'redirect_to_nextjs_checkout'));
        
        // Add custom button di product page
        add_action('woocommerce_after_add_to_cart_button', array($this, 'add_custom_checkout_button'));
        
        // Add custom button di cart page
        add_action('woocommerce_proceed_to_checkout', array($this, 'add_custom_checkout_button_cart'));
        
        // Sync cart data via AJAX
        add_action('wp_ajax_sync_cart_to_nextjs', array($this, 'sync_cart_to_nextjs'));
        add_action('wp_ajax_nopriv_sync_cart_to_nextjs', array($this, 'sync_cart_to_nextjs'));
        
        // Add custom styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        
        // Handle redirect after login/register
        add_filter('woocommerce_login_redirect', array($this, 'custom_login_redirect'), 10, 2);
        add_filter('woocommerce_registration_redirect', array($this, 'custom_registration_redirect'));
    }
    
    /**
     * Redirect WooCommerce checkout ke Next.js
     */
    public function redirect_to_nextjs_checkout() {
        if (is_checkout() && !is_wc_endpoint_url()) {
            // Sync cart sebelum redirect
            $this->sync_cart_data();
            
            // Redirect ke Next.js checkout
            wp_redirect($this->nextjs_checkout_url . '/cart');
            exit;
        }
    }
    
    /**
     * Add custom "Beli Sekarang" button di product page
     */
    public function add_custom_checkout_button() {
        global $product;
        
        echo '<div class="custom-checkout-wrapper" style="margin-top: 10px;">';
        echo '<button type="button" class="button alt custom-checkout-btn" 
                onclick="redirectToCustomCheckout(' . $product->get_id() . ')"
                style="background: #0073aa; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                <i class="fas fa-credit-card"></i> Beli Sekarang
              </button>';
        echo '</div>';
        
        // Add JavaScript
        $this->add_checkout_script();
    }
    
    /**
     * Add custom button di cart page
     */
    public function add_custom_checkout_button_cart() {
        echo '<div class="custom-checkout-wrapper" style="margin: 20px 0;">';
        echo '<a href="' . $this->nextjs_checkout_url . '/cart" 
                class="button alt custom-checkout-btn" 
                style="background: #0073aa; color: white; padding: 15px 30px; border: none; border-radius: 4px; text-decoration: none; display: inline-block;">
                <i class="fas fa-lock"></i> Checkout Aman dengan Next.js
              </a>';
        echo '<p style="font-size: 12px; color: #666; margin-top: 5px;">
                <i class="fas fa-shield-alt"></i> Pembayaran aman dan terenkripsi
              </p>';
        echo '</div>';
    }
    
    /**
     * Sync cart data ke Next.js via API
     */
    public function sync_cart_to_nextjs() {
        if (!function_exists('WC')) {
            return;
        }
        
        $cart = WC()->cart;
        $cart_items = array();
        
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            $cart_items[] = array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'price' => $product->get_price(),
                'quantity' => $cart_item['quantity'],
                'image' => wp_get_attachment_url($product->get_image_id()),
                'sku' => $product->get_sku(),
                'weight' => $product->get_weight(),
            );
        }
        
        $cart_data = array(
            'items' => $cart_items,
            'total' => $cart->get_total('edit'),
            'subtotal' => $cart->get_subtotal('edit'),
            'currency' => get_woocommerce_currency(),
            'customer_email' => WC()->customer->get_email(),
            'customer_first_name' => WC()->customer->get_first_name(),
            'customer_last_name' => WC()->customer->get_last_name(),
        );
        
        // Send to Next.js API
        $response = wp_remote_post($this->nextjs_checkout_url . '/api/sync-cart', array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode($cart_data),
        ));
        
        if (is_wp_error($response)) {
            error_log('Failed to sync cart to Next.js: ' . $response->get_error_message());
        }
        
        wp_send_json_success($cart_data);
    }
    
    /**
     * Sync cart data sebelum redirect
     */
    private function sync_cart_data() {
        if (function_exists('WC') && !empty(WC()->cart->get_cart())) {
            $this->sync_cart_to_nextjs();
        }
    }
    
    /**
     * Add JavaScript untuk redirect
     */
    private function add_checkout_script() {
        ?>
        <script>
        function redirectToCustomCheckout(productId) {
            // Add to cart dulu jika belum
            jQuery.post('<?php echo admin_url('admin-ajax.php'); ?>', {
                action: 'woocommerce_add_to_cart',
                product_id: productId,
                quantity: 1
            }, function(response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    // Sync cart lalu redirect
                    jQuery.post('<?php echo admin_url('admin-ajax.php'); ?>', {
                        action: 'sync_cart_to_nextjs'
                    }, function() {
                        window.location.href = '<?php echo $this->nextjs_checkout_url; ?>/cart';
                    });
                }
            });
        }
        
        // Auto-sync cart saat halaman load
        jQuery(document).ready(function($) {
            <?php if (is_cart() || is_shop() || is_product()): ?>
            $.post('<?php echo admin_url('admin-ajax.php'); ?>', {
                action: 'sync_cart_to_nextjs'
            });
            <?php endif; ?>
        });
        </script>
        <?php
    }
    
    /**
     * Enqueue custom styles
     */
    public function enqueue_styles() {
        wp_enqueue_style('nextjs-checkout-style', plugins_url('style.css', __FILE__));
    }
    
    /**
     * Custom redirect after login
     */
    public function custom_login_redirect($redirect, $user) {
        // Redirect ke Next.js checkout jika ada cart
        if (function_exists('WC') && !empty(WC()->cart->get_cart())) {
            return $this->nextjs_checkout_url . '/cart';
        }
        return $redirect;
    }
    
    /**
     * Custom redirect after registration
     */
    public function custom_registration_redirect($redirect) {
        if (function_exists('WC') && !empty(WC()->cart->get_cart())) {
            return $this->nextjs_checkout_url . '/cart';
        }
        return $redirect;
    }
}

// Initialize the plugin
new NextJSCheckoutIntegration();

// API endpoint untuk menerima data dari Next.js
add_action('rest_api_init', function () {
    register_rest_route('nextjs-checkout/v1', '/order-created', array(
        'methods' => 'POST',
        'callback' => 'handle_nextjs_order_created',
        'permission_callback' => function () {
            // Verifikasi API key untuk security
            $api_key = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';
            return $api_key === 'your-secret-api-key'; // Ganti dengan API key yang aman
        },
    ));
});

function handle_nextjs_order_created($request) {
    $order_data = $request->get_json_params();
    
    // Log order creation
    error_log('Order created in Next.js: ' . json_encode($order_data));
    
    // Update status order di WooCommerce jika perlu
    if (isset($order_data['woo_order_id'])) {
        $order = wc_get_order($order_data['woo_order_id']);
        if ($order) {
            $order->update_status('processing', 'Order created via Next.js checkout');
            $order->save();
        }
    }
    
    return array('success' => true, 'message' => 'Order received');
}

// Add custom endpoint untuk cart sync
add_action('rest_api_init', function () {
    register_rest_route('nextjs-checkout/v1', '/cart', array(
        'methods' => 'GET',
        'callback' => 'get_cart_data',
        'permission_callback' => '__return_true',
    ));
});

function get_cart_data() {
    if (!function_exists('WC')) {
        return array('error' => 'WooCommerce not available');
    }
    
    $cart = WC()->cart;
    $cart_items = array();
    
    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        $product = $cart_item['data'];
        $cart_items[] = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'price' => $product->get_price(),
            'quantity' => $cart_item['quantity'],
            'image' => wp_get_attachment_url($product->get_image_id()),
            'sku' => $product->get_sku(),
        );
    }
    
    return array(
        'items' => $cart_items,
        'total' => $cart->get_total('edit'),
        'subtotal' => $cart->get_subtotal('edit'),
        'currency' => get_woocommerce_currency(),
    );
}
