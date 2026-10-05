import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { CategoryFilter } from './components/CategoryFilter.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { StripeCheckoutModal } from './components/StripeCheckoutModal.js';
import { OrderTrackingDashboard } from './components/OrderTrackingDashboard.js';
import { NotificationCenter } from './components/NotificationCenter.js';
import { PushNotificationToast } from './components/PushNotificationToast.js';
import { MerchantDashboard } from './components/MerchantDashboard.js';
import { AuthModal } from './components/AuthModal.js';
import { XamppModal } from './components/XamppModal.js';

import { Product, CartItem, Order, User, NotificationItem, BuildingCategory } from './types.js';
import { api } from './services/api.js';
import { Truck, ShieldCheck, HardHat, Phone, Scale, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<'storefront' | 'tracking' | 'merchant'>('storefront');

  // Products and Filtering
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('localwork_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders and Tracking
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | undefined>(undefined);

  // User and Auth
  const [user, setUser] = useState<User | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isXamppOpen, setIsXamppOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Save cart
  useEffect(() => {
    localStorage.setItem('localwork_cart', JSON.stringify(cart));
  }, [cart]);

  // Initial Load: User, Products, Orders, Notifications
  const fetchData = async () => {
    try {
      // Load current user
      const { user: currentUser } = await api.getMe();
      setUser(currentUser);

      // Load categories
      const catData = await api.getCategories();
      setCategories(catData.categories);

      // Load products
      const prodData = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        inStockOnly,
        sort: sortBy
      });
      setProducts(prodData.products);

      // Load orders
      const orderData = await api.getOrders();
      setOrders(orderData.orders);
      if (orderData.orders.length > 0 && !activeOrderId) {
        setActiveOrderId(orderData.orders[0].id);
      }

      // Load notifications
      const notifData = await api.getNotifications(currentUser?.id);
      setNotifications(notifData.notifications);
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Re-fetch products when filters change
  useEffect(() => {
    let isMounted = true;
    async function filterProducts() {
      setLoadingProducts(true);
      try {
        const prodData = await api.getProducts({
          category: selectedCategory,
          search: searchQuery,
          inStockOnly,
          sort: sortBy
        });
        if (isMounted) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error('Filter error:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    const timer = setTimeout(filterProducts, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery, inStockOnly, sortBy]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, isPallet: boolean) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.isPallet === isPallet
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, isPallet }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, isPallet: boolean) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, isPallet);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.isPallet === isPallet
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, isPallet: boolean) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.isPallet === isPallet)
      )
    );
  };

  // Cart Totals
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartWeightLbs = useMemo(() => {
    return cart.reduce((sum, item) => {
      const unitWeight = item.isPallet && item.product.palletQuantity
        ? item.product.weightLbs * item.product.palletQuantity
        : item.product.weightLbs;
      return sum + unitWeight * item.quantity;
    }, 0);
  }, [cart]);

  // Payment Success Handler
  const handlePaymentSuccess = (newOrder: Order) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    setCurrentView('tracking');

    const newNotif: NotificationItem = {
      id: `toast-${Date.now()}`,
      userId: user?.id || 'usr-contractor-01',
      orderId: newOrder.id,
      title: `Order ${newOrder.orderNumber} Authorized via Stripe`,
      message: `${newOrder.totalWeightLbs.toLocaleString()} lbs allocated for jobsite freight dispatch.`,
      type: 'order_status',
      read: false,
      createdAt: new Date().toISOString()
    };
    setActiveToast(newNotif);
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Refresh notifications and orders
  const refreshNotifs = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data.notifications);
    } catch (err) {
      console.warn('Failed refreshing notifications:', err);
    }
  };

  const refreshOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
    } catch (err) {
      console.warn('Failed refreshing orders:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Universal Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={totalCartCount}
        totalCartWeightLbs={totalCartWeightLbs}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        unreadNotifsCount={notifications.filter((n) => !n.read).length}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenXampp={() => setIsXamppOpen(true)}
      />

      {/* Floating Push Notification Toast Alert */}
      <PushNotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onViewOrder={(orderId) => {
          setActiveOrderId(orderId);
          setCurrentView('tracking');
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'storefront' && (
          <div>
            {/* Hero Section with Depot Photography */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onQuickCategory={(cat) => {
                setSelectedCategory(cat);
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onTrackOrderClick={() => {
                setCurrentView('tracking');
              }}
            />

            {/* Building Material Category Bar & Controls */}
            <div id="catalog-grid">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                sortBy={sortBy}
                onSortChange={setSortBy}
                categories={categories}
                resultCount={products.length}
              />
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {loadingProducts ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                  <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Querying Regional Construction Depot Inventory...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center max-w-md mx-auto">
                  <Truck className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-white mb-1">
                    No Matching Building Materials Found
                  </h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    Try adjusting your category filter, clearing your search query, or checking back for special mill orders.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setInStockOnly(false);
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Logistics & Contractor Proof Banner */}
            <section className="bg-neutral-900 border-t border-b border-neutral-800 py-12 px-4 sm:px-6 lg:px-8 mt-12">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white uppercase mb-1">
                      Direct Flatbed Rigging
                    </h4>
                    <p className="text-neutral-400 leading-relaxed">
                      Onboard Moffett truck-mounted forklifts offload directly to jobsite gates or staging zones. No ground delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white uppercase mb-1">
                      ASTM Certified Supply
                    </h4>
                    <p className="text-neutral-400 leading-relaxed">
                      Every batch of Portland cement, Grade 60 rebar, and framing lumber includes certified mill test reports and submittal sheets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white uppercase mb-1">
                      Stripe & Net-30 Invoicing
                    </h4>
                    <p className="text-neutral-400 leading-relaxed">
                      Instant commercial credit terms or seamless Stripe payment processing with detailed weight & freight audit receipts.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'tracking' && (
          <OrderTrackingDashboard
            orders={orders}
            activeOrderId={activeOrderId}
            onSelectOrder={setActiveOrderId}
            onBackToCatalog={() => setCurrentView('storefront')}
            onRefreshOrders={refreshOrders}
          />
        )}

        {currentView === 'merchant' && (
          <MerchantDashboard
            orders={orders}
            products={products}
            onRefreshData={() => {
              refreshOrders();
              fetchData();
            }}
            onSelectOrder={(orderId) => {
              setActiveOrderId(orderId);
              setCurrentView('tracking');
            }}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <NotificationCenter
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onSelectOrder={(orderId) => {
          setActiveOrderId(orderId);
          setCurrentView('tracking');
        }}
        onRefreshNotifs={refreshNotifs}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={(u) => {
          setUser(u);
          refreshNotifs();
        }}
        onLogout={() => {
          setUser(null);
        }}
      />

      <XamppModal
        isOpen={isXamppOpen}
        onClose={() => setIsXamppOpen(false)}
      />

      {/* Universal Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white uppercase text-base">
              LOCALWORK
            </span>
            <span aria-hidden="true">·</span>
            <span>Commercial Construction Supply & Logistics Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('storefront')}
              className="hover:text-white transition-colors"
            >
              Catalog
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className="hover:text-white transition-colors"
            >
              Order Tracking
            </button>
            <button
              onClick={() => setCurrentView('merchant')}
              className="hover:text-white transition-colors"
            >
              Merchant Ops
            </button>
            <button
              onClick={() => setIsXamppOpen(true)}
              className="text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-1"
            >
              <span>Host on XAMPP (PHP/MySQL)</span>
            </button>
            <span className="font-mono text-neutral-500">
              © {new Date().getFullYear()} LOCALWORK Inc.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
