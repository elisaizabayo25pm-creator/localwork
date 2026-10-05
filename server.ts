import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';
import { OrderStatus } from './src/types.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes

// Categories endpoint
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = [
    { id: 'all', name: 'All Materials', count: 9 },
    { id: 'masonry', name: 'Masonry & Cement', count: 2, icon: 'Hammer' },
    { id: 'timber', name: 'Framing & Timber', count: 1, icon: 'Trees' },
    { id: 'steel', name: 'Structural Steel & Rebar', count: 1, icon: 'Layers' },
    { id: 'drywall', name: 'Drywall & Insulation', count: 1, icon: 'Square' },
    { id: 'roofing', name: 'Roofing & Waterproofing', count: 1, icon: 'Shield' },
    { id: 'plumbing', name: 'Plumbing & Drainage', count: 1, icon: 'Wrench' },
    { id: 'fasteners', name: 'Fasteners & Hardware', count: 1, icon: 'Cpu' },
    { id: 'tools', name: 'Tools & Jobsite Gear', count: 1, icon: 'Tool' }
  ];
  res.json({ categories });
});

// Products endpoint
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, inStockOnly, sort } = req.query;

  const products = db.getProducts({
    category: category ? String(category) : undefined,
    search: search ? String(search) : undefined,
    minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
    maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
    inStockOnly: inStockOnly === 'true',
    sort: sort as any
  });

  res.json({ products, total: products.length });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

// User Auth endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid contractor credentials or unregistered account' });
    return;
  }

  res.json({
    user,
    token: `lw_token_${user.id}_${Date.now()}`
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, companyName, contractorLicense, phone, deliveryAddress } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser = db.createUser({
    name,
    email,
    role: role || 'contractor',
    companyName: companyName || '',
    contractorLicense: contractorLicense || '',
    phone: phone || '',
    deliveryAddress: deliveryAddress || ''
  });

  res.status(201).json({
    user: newUser,
    token: `lw_token_${newUser.id}_${Date.now()}`
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return default demo contractor for easy testing
    const defaultUser = db.findUserById('usr-contractor-01') || db.getUsers()[0];
    res.json({ user: defaultUser });
    return;
  }

  const userId = authHeader.replace('Bearer ', '').split('_')[2];
  const user = db.findUserById(userId) || db.findUserById('usr-contractor-01');
  res.json({ user });
});

// Orders endpoints
app.get('/api/orders', (req: Request, res: Response) => {
  const userId = req.query.userId ? String(req.query.userId) : undefined;
  const orders = db.getOrders(userId);
  res.json({ orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData.items || !orderData.items.length) {
    res.status(400).json({ error: 'Order items are required' });
    return;
  }

  const order = db.createOrder(orderData);
  res.status(201).json({ order });
});

// Status Advance simulation (for real-time order tracking & push notifications demo)
app.post('/api/orders/:id/advance-status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nextStatus, customMessage } = req.body;

  const currentOrder = db.getOrderById(id);
  if (!currentOrder) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const statusOrder: OrderStatus[] = [
    'ORDER_PLACED',
    'RIGGING_PACKED',
    'FREIGHT_DISPATCHED',
    'EN_ROUTE',
    'DELIVERED'
  ];

  let targetStatus: OrderStatus = nextStatus;
  if (!targetStatus) {
    const currentIndex = statusOrder.indexOf(currentOrder.status);
    const nextIndex = Math.min(currentIndex + 1, statusOrder.length - 1);
    targetStatus = statusOrder[nextIndex];
  }

  const result = db.updateOrderStatus(id, targetStatus, customMessage);
  if (!result) {
    res.status(500).json({ error: 'Failed to update order status' });
    return;
  }

  res.json({
    order: result.order,
    notification: result.notification,
    message: `Order status advanced to ${targetStatus}`
  });
});

// Stripe Payment Gateway Integration Simulation
app.post('/api/stripe/create-payment-intent', (req: Request, res: Response) => {
  const { items, deliveryDetails, isNet30 } = req.body;
  if (!items || !items.length) {
    res.status(400).json({ error: 'No items in payment intent' });
    return;
  }

  let subtotal = 0;
  let totalWeightLbs = 0;

  for (const item of items) {
    const itemTotal = item.isPallet && item.product.palletPrice
      ? item.product.palletPrice * item.quantity
      : item.product.price * item.quantity;
    const itemWeight = item.isPallet && item.product.palletQuantity
      ? item.product.weightLbs * item.product.palletQuantity * item.quantity
      : item.product.weightLbs * item.quantity;

    subtotal += itemTotal;
    totalWeightLbs += itemWeight;
  }

  // 10% Contractor trade discount on orders above $1,000
  const discount = subtotal > 1000 ? subtotal * 0.10 : 0;

  // Freight calculation based on logistics weight
  let freightCost = 45; // Courier / small van
  if (totalWeightLbs > 2000) {
    freightCost = 240; // Heavy flatbed with Moffett forklift offloader
  } else if (totalWeightLbs > 500) {
    freightCost = 120; // Medium flatbed truck
  }

  const tax = (subtotal - discount) * 0.0825; // Standard 8.25% sales tax
  const total = subtotal - discount + freightCost + tax;

  const paymentIntentId = `pi_lw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

  res.json({
    id: paymentIntentId,
    clientSecret,
    amount: Math.round(total * 100), // in cents
    currency: 'usd',
    status: isNet30 ? 'net30_approved' : 'requires_payment_method',
    breakdown: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      freight: parseFloat(freightCost.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalWeightLbs: Math.round(totalWeightLbs)
    }
  });
});

app.post('/api/stripe/confirm-payment', (req: Request, res: Response) => {
  const { paymentIntentId, paymentMethod, orderData } = req.body;
  if (!paymentIntentId || !orderData) {
    res.status(400).json({ error: 'Missing payment intent or order payload' });
    return;
  }

  const newOrder = db.createOrder({
    ...orderData,
    stripePaymentId: paymentIntentId,
    paymentMethod: paymentMethod || 'Stripe Card (Visa •••• 4242)',
    status: 'ORDER_PLACED',
    paidAt: new Date().toISOString(),
    carrierInfo: {
      name: 'LocalWork Heavy Logistics Fleet #FL-402',
      vehicle: orderData.totalWeightLbs > 2000 ? 'Freightliner M2 106 Flatbed Crane Rig' : 'Ford F-550 Super Duty Stake Bed',
      driverName: 'Dave Kowalski (Class A CDL)',
      driverPhone: '(702) 555-0721',
      licensePlate: 'COMM-9284-NV',
      gpsCoordinates: { lat: 36.1699, lng: -115.1398 },
      currentProgressPct: 10,
      etaMinutes: 45
    },
    statusHistory: [
      {
        status: 'ORDER_PLACED',
        label: 'Order Confirmed',
        description: 'Payment verified via Stripe. Material allocation confirmed.',
        timestamp: new Date().toISOString(),
        completed: true,
        current: true
      },
      {
        status: 'RIGGING_PACKED',
        label: 'Yard Rigging & Strapping',
        description: 'Materials staging in warehouse dispatch bay.',
        timestamp: '',
        completed: false,
        current: false
      },
      {
        status: 'FREIGHT_DISPATCHED',
        label: 'Flatbed Rig Loaded',
        description: 'Strapped and weighed on axle scales.',
        timestamp: '',
        completed: false,
        current: false
      },
      {
        status: 'EN_ROUTE',
        label: 'En Route to Jobsite',
        description: 'Dispatched with live GPS jobsite navigation.',
        timestamp: '',
        completed: false,
        current: false
      },
      {
        status: 'DELIVERED',
        label: 'Jobsite Offloading',
        description: 'Jobsite delivery complete with proof of offload.',
        timestamp: '',
        completed: false,
        current: false
      }
    ]
  });

  res.json({
    success: true,
    order: newOrder,
    message: 'Payment confirmed and freight dispatch scheduled'
  });
});

// Notifications endpoints
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId ? String(req.query.userId) : 'usr-contractor-01';
  const notifications = db.getNotifications(userId);
  res.json({ notifications, unreadCount: notifications.filter(n => !n.read).length });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  db.markNotificationsRead(userId || 'usr-contractor-01');
  res.json({ success: true });
});

app.post('/api/notifications/test-push', (req: Request, res: Response) => {
  const { userId, title, message } = req.body;
  const notif = db.createNotification({
    userId: userId || 'usr-contractor-01',
    title: title || 'Jobsite Flatbed Alert',
    message: message || 'Truck #FL-402 is arriving in 5 minutes at Jobsite Gate 4. Clear the unloading zone.',
    type: 'dispatch',
    read: false
  });
  res.json({ notification: notif });
});

// Merchant / Shopify-like Operations API
app.get('/api/merchant/stats', (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeDeliveries = orders.filter(o => o.status !== 'DELIVERED').length;
  const lowStock = products.filter(p => p.stockQuantity < 100).length;
  const totalWeightShipped = orders.reduce((sum, o) => sum + o.totalWeightLbs, 0);

  res.json({
    totalRevenue,
    orderCount: orders.length,
    activeDeliveries,
    lowStock,
    totalWeightShipped,
    totalProducts: products.length
  });
});

app.post('/api/merchant/products', (req: Request, res: Response) => {
  const newProduct = db.createProduct(req.body);
  res.status(201).json({ product: newProduct });
});

app.patch('/api/merchant/products/:id', (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product: updated });
});

// XAMPP Package Export & Deployment endpoints
app.get('/api/xampp/download', (_req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'localwork_xampp.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'localwork_xampp.zip');
  } else {
    res.status(404).json({ error: 'XAMPP zip package not found. Please regenerate.' });
  }
});

app.get('/api/xampp/files', (_req: Request, res: Response) => {
  try {
    const xamppDir = path.resolve(process.cwd(), 'xampp_export');
    const readSafe = (relPath: string) => {
      const full = path.join(xamppDir, relPath);
      return fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : '';
    };

    res.json({
      success: true,
      files: {
        'database.sql': readSafe('database.sql'),
        'config/db.php': readSafe('config/db.php'),
        'index.php': readSafe('index.php'),
        'api/products.php': readSafe('api/products.php'),
        'api/orders.php': readSafe('api/orders.php'),
        'api/stripe.php': readSafe('api/stripe.php'),
        'api/notifications.php': readSafe('api/notifications.php'),
        'api/auth.php': readSafe('api/auth.php'),
        'README_XAMPP.txt': readSafe('README_XAMPP.txt')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LOCALWORK Construction Supply Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
