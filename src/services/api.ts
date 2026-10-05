import { Product, Order, NotificationItem, PaymentIntentResponse, User, OrderStatus } from '../types.js';

export const api = {
  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    return data.product;
  },

  async getCategories(): Promise<{ categories: { id: string; name: string; count: number; icon: string }[] }> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(token?: string): Promise<{ user: User }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/auth/me', { headers });
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  // Orders
  async getOrders(userId?: string): Promise<{ orders: Order[] }> {
    const url = userId ? `/api/orders?userId=${encodeURIComponent(userId)}` : '/api/orders';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    const data = await res.json();
    return data.order;
  },

  async advanceOrderStatus(id: string, nextStatus?: OrderStatus, customMessage?: string): Promise<{ order: Order; notification: NotificationItem }> {
    const res = await fetch(`/api/orders/${id}/advance-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus, customMessage })
    });
    if (!res.ok) throw new Error('Failed to advance order status');
    return res.json();
  },

  // Stripe Payment Gateway
  async createPaymentIntent(payload: {
    items: { product: Product; quantity: number; isPallet: boolean }[];
    deliveryDetails: any;
    isNet30?: boolean;
  }): Promise<PaymentIntentResponse> {
    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to initiate payment intent');
    return res.json();
  },

  async confirmStripePayment(payload: {
    paymentIntentId: string;
    paymentMethod: string;
    orderData: any;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/stripe/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Payment confirmation failed');
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const url = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationsRead(userId?: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async testPushAlert(userId?: string, title?: string, message?: string): Promise<{ notification: NotificationItem }> {
    const res = await fetch('/api/notifications/test-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, message })
    });
    return res.json();
  },

  // Merchant Portal
  async getMerchantStats(): Promise<{
    totalRevenue: number;
    orderCount: number;
    activeDeliveries: number;
    lowStock: number;
    totalWeightShipped: number;
    totalProducts: number;
  }> {
    const res = await fetch('/api/merchant/stats');
    if (!res.ok) throw new Error('Failed to fetch merchant stats');
    return res.json();
  },

  async updateMerchantProduct(id: string, updates: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async addMerchantProduct(productData: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch('/api/merchant/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
  }
};
