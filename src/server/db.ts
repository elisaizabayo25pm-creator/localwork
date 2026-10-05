import fs from 'fs';
import path from 'path';
import { Product, User, Order, NotificationItem, OrderStatus, TrackingStep } from '../types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'localwork_db.json');

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  notifications: NotificationItem[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cement-01',
    name: 'Type I/II Portland Cement (94 lb Bag)',
    category: 'Masonry & Cement',
    subcategory: 'Hydraulic Cement',
    sku: 'CEM-POR-94',
    brand: 'Lehigh Hanson / Quikrete Spec',
    description: 'General purpose heavy-duty Portland cement engineered for structural concrete pours, precast elements, mortar, and grouts. Compliant with ASTM C150 specs with rapid initial set.',
    price: 18.50,
    unit: 'per 94lb bag',
    palletPrice: 666.00, // 40 bags * 18.50 minus 10% discount = $666
    palletQuantity: 40,
    minOrderQty: 1,
    weightLbs: 94,
    astmStandard: 'ASTM C150 / AASHTO M85',
    stockQuantity: 480,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 142,
    imageUrl: '/src/assets/images/product_portland_cement_1791194211417.jpg',
    specifications: {
      'Compressive Strength (28d)': '4,200+ PSI',
      'Initial Set Time': '90–120 minutes',
      'Bag Weight': '94 lbs (42.6 kg)',
      'Pallet Yield': '40 bags / 3,760 lbs',
      'Compliance': 'ASTM C150 Type I/II, Low Alkali'
    }
  },
  {
    id: 'prod-timber-01',
    name: 'Douglas Fir 2x4 Kiln-Dried #2 Framing Stud (16 ft)',
    category: 'Framing & Timber',
    subcategory: 'Dimensional Lumber',
    sku: 'LBR-DF-2416',
    brand: 'Weyerhaeuser Premium Select',
    description: 'Premium structural grade kiln-dried Douglas Fir framing lumber. Milled straight with minimal crown, high load-bearing shear strength, ideal for load-bearing residential and light commercial walls.',
    price: 9.85,
    unit: 'per 16ft piece',
    palletPrice: 1720.00,
    palletQuantity: 208, // bundle of 208 pcs
    minOrderQty: 5,
    weightLbs: 18.2,
    astmStandard: 'ASTM D1990 / NLGA Graded',
    stockQuantity: 1250,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 98,
    imageUrl: '/src/assets/images/product_structural_timber_1791194221203.jpg',
    specifications: {
      'Nominal Dimensions': '2 in. x 4 in. x 16 ft.',
      'Actual Dimensions': '1.5 in. x 3.5 in. x 192 in.',
      'Moisture Content': 'KD-19 (≤ 19%)',
      'Species': 'Douglas Fir-Larch (DF-L)',
      'Structural Rating': '#2 and Better'
    }
  },
  {
    id: 'prod-steel-01',
    name: '#5 (5/8") Grade 60 Deformed Steel Rebar (20 ft Rod)',
    category: 'Structural Steel & Rebar',
    subcategory: 'Reinforcing Steel',
    sku: 'REB-GR60-0520',
    brand: 'Nucor Steel Mill',
    description: 'High-tensile hot-rolled ASTM A615 Grade 60 deformed rebar. Essential for structural footings, grade beams, retaining walls, slab reinforcement, and bridge decking.',
    price: 24.50,
    unit: 'per 20ft rod',
    palletPrice: 2200.00,
    palletQuantity: 100, // 100 rod mill bundle
    minOrderQty: 10,
    weightLbs: 20.8,
    astmStandard: 'ASTM A615 / A615M Grade 60',
    stockQuantity: 840,
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 76,
    imageUrl: '/src/assets/images/product_steel_rebar_1791194232380.jpg',
    specifications: {
      'Bar Size': '#5 (Nominal Diameter: 0.625 in.)',
      'Yield Strength': '60,000 PSI minimum',
      'Length': '20 ft. (6.1 meters)',
      'Linear Weight': '1.043 lbs / ft.',
      'Standard': 'ASTM A615 Deformed Carbon Steel'
    }
  },
  {
    id: 'prod-tools-01',
    name: 'Industrial 20V SDS-Plus Brushless Rotary Hammer Kit',
    category: 'Tools & Jobsite Gear',
    subcategory: 'Concrete Power Tools',
    sku: 'TLS-SDS-20V',
    brand: 'DeWalt Industrial Jobsite Series',
    description: 'Heavy-duty 1-1/8 inch brushless SDS-Plus rotary hammer delivering 2.6 Joules of impact energy. Includes 2x 6.0Ah high-capacity batteries, rapid dual charger, side handle with depth gauge, and TSTAK rugged hard-case.',
    price: 389.00,
    unit: 'per complete kit',
    minOrderQty: 1,
    weightLbs: 14.5,
    astmStandard: 'ANSI / OSHA Table 1 Dust Ready',
    stockQuantity: 65,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 215,
    imageUrl: '/src/assets/images/product_contractor_tools_1791194242153.jpg',
    specifications: {
      'Impact Energy': '2.6 Joules (1.9 ft-lbs)',
      'Motor': 'Brushless Heavy-Duty Magnet',
      'Chuck System': 'SDS-Plus Quick Lock',
      'Battery System': '20V MAX* XR 6.0Ah Lithium',
      'Modes': 'Hammer Drill, Drill Only, Chisel'
    }
  },
  {
    id: 'prod-masonry-02',
    name: 'Spec-Mix Type S Structural Mortar (80 lb Bag)',
    category: 'Masonry & Cement',
    subcategory: 'Pre-blended Mortar',
    sku: 'MOR-TYP-S80',
    brand: 'Spec-Mix Factory Engineered',
    description: 'High-strength structural mortar for laying concrete block, load-bearing brick, stone veneer, and foundation masonry. Formulated for superior bond adhesion and weather durability.',
    price: 14.75,
    unit: 'per 80lb bag',
    palletPrice: 560.00,
    palletQuantity: 42,
    minOrderQty: 4,
    weightLbs: 80,
    astmStandard: 'ASTM C270 / ASTM C1714',
    stockQuantity: 360,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 54,
    imageUrl: '/src/assets/images/product_portland_cement_1791194211417.jpg',
    specifications: {
      'Strength Rating': 'Type S (1,800 PSI at 28 days)',
      'Coverage': 'Approx. 12–14 standard concrete blocks',
      'Aggregate': 'Washed graded masonry sand',
      'Bag Weight': '80 lbs (36.3 kg)'
    }
  },
  {
    id: 'prod-drywall-01',
    name: '5/8 in. x 4 ft. x 8 ft. Type X Fire-Rated Drywall Sheet',
    category: 'Drywall & Insulation',
    subcategory: 'Gypsum Panels',
    sku: 'DW-TYPX-5848',
    brand: 'USG Sheetrock Brand EcoSmart',
    description: 'UL-classified 5/8" fire-rated gypsum wallboard designed for commercial partition walls, shaftwalls, and garage ceilings requiring 1-hour to 2-hour fire endurance ratings.',
    price: 21.20,
    unit: 'per 4x8 sheet',
    palletPrice: 650.00,
    palletQuantity: 34,
    minOrderQty: 6,
    weightLbs: 70.4,
    astmStandard: 'ASTM C1396 / UL Classified Type X',
    stockQuantity: 520,
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 68,
    imageUrl: '/src/assets/images/hero_construction_depot_1791194199359.jpg',
    specifications: {
      'Thickness': '5/8 inch (15.9 mm)',
      'Dimensions': '4 ft. x 8 ft.',
      'Fire Rating': 'UL Listed Type X (1–2 Hour Assemblies)',
      'Edge Detail': 'Tapered Edge for Flat Joint Finish',
      'Weight': 'Approx 2.2 lbs / sq. ft.'
    }
  },
  {
    id: 'prod-roofing-01',
    name: 'Owens Corning Oakridge Architectural Shingles (Bundle)',
    category: 'Roofing & Waterproofing',
    subcategory: 'Asphalt Shingles',
    sku: 'ROOF-OC-OAK',
    brand: 'Owens Corning TruDefinition',
    description: 'Laminated architectural fiberglass asphalt shingles with 110 MPH wind resistance warranty and StreakGuard algae protection. 3 bundles cover 100 sq. ft. (1 roof square).',
    price: 36.80,
    unit: 'per bundle (33.3 sq ft)',
    palletPrice: 1390.00,
    palletQuantity: 40,
    minOrderQty: 3,
    weightLbs: 68,
    astmStandard: 'ASTM D3462 / ASTM D3161 Class F',
    stockQuantity: 410,
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 88,
    imageUrl: '/src/assets/images/hero_construction_depot_1791194199359.jpg',
    specifications: {
      'Colorway': 'Estate Gray / Onyx Shadow',
      'Wind Warranty': '110–130 MPH with 6-nail install',
      'Exposure': '5-5/8 inches',
      'Coverage per Bundle': '32.8 sq. ft.',
      'Fire Rating': 'Class A UL 790'
    }
  },
  {
    id: 'prod-plumbing-01',
    name: 'Schedule 40 PVC Rigid Conduit Pipe (2 in. x 10 ft.)',
    category: 'Plumbing & Drainage',
    subcategory: 'Rigid Conduit & Pipe',
    sku: 'CON-PVC40-2010',
    brand: 'JM Eagle / Cantex Infrastructure',
    description: 'Sunlight-resistant Schedule 40 heavy-wall PVC electrical & underground drainage conduit with integrated bell end for quick solvent cement coupling.',
    price: 28.40,
    unit: 'per 10ft pipe',
    palletPrice: 1980.00,
    palletQuantity: 80,
    minOrderQty: 4,
    weightLbs: 7.2,
    astmStandard: 'ASTM D1785 / NEMA TC-2 / UL 651',
    stockQuantity: 340,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 42,
    imageUrl: '/src/assets/images/hero_construction_depot_1791194199359.jpg',
    specifications: {
      'Nominal Size': '2 inch diameter',
      'Wall Thickness': 'Schedule 40 Heavy Wall (0.154 in.)',
      'Connection': 'Belled End Bell & Spigot',
      'UV Rating': 'Sunlight & Direct Burial Rated'
    }
  },
  {
    id: 'prod-fasteners-01',
    name: 'Simpson Strong-Tie Heavy Framing Screws (1,000 Box)',
    category: 'Fasteners & Hardware',
    subcategory: 'Structural Screws',
    sku: 'FAST-SST-SDWS',
    brand: 'Simpson Strong-Tie SDWS Timber',
    description: 'High-strength structural wood screws with SawTooth point and low-profile washer head. Code-approved alternative to lag screws and thru-bolts without pre-drilling.',
    price: 145.00,
    unit: 'per 1,000 ct box',
    minOrderQty: 1,
    weightLbs: 18.5,
    astmStandard: 'ICC-ES ESR-3046 / ASTM A510',
    stockQuantity: 180,
    inStock: true,
    featured: false,
    rating: 5.0,
    reviewCount: 67,
    imageUrl: '/src/assets/images/product_contractor_tools_1791194242153.jpg',
    specifications: {
      'Screw Length': '3-1/2 in. (0.220 in. shank)',
      'Drive Type': 'T-40 6-Lobe Star Drive',
      'Coating': 'Double-Barrier Exterior Galvanic',
      'Shear Capacity': 'Exceeds standard 1/2" lag screws'
    }
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-contractor-01',
    name: 'Marcus Vance',
    email: 'marcus@vanceconstruction.com',
    role: 'contractor',
    companyName: 'Vance Commercial Builders LLC',
    contractorLicense: 'GC-NV-9041284',
    phone: '(702) 555-0194',
    deliveryAddress: '742 Evergreen Terr, Jobsite Gate 4, Sector B'
  },
  {
    id: 'usr-merchant-01',
    name: 'Sarah Lin',
    email: 'admin@localworksupply.com',
    role: 'merchant',
    companyName: 'LocalWork Central Distribution Yard #12',
    contractorLicense: 'SUPPLIER-LIC-20419',
    phone: '(702) 555-0810',
    deliveryAddress: 'Distribution Depot Yard 12, Terminal Way'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-lw-98241',
    orderNumber: 'LW-98241',
    userId: 'usr-contractor-01',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@vanceconstruction.com',
    companyName: 'Vance Commercial Builders LLC',
    items: [
      {
        productId: 'prod-cement-01',
        productName: 'Type I/II Portland Cement (94 lb Bag)',
        sku: 'CEM-POR-94',
        unit: 'per 94lb bag',
        unitPrice: 16.65,
        quantity: 80,
        isPallet: true,
        totalWeightLbs: 7520,
        totalPrice: 1332.00,
        imageUrl: '/src/assets/images/product_portland_cement_1791194211417.jpg'
      },
      {
        productId: 'prod-steel-01',
        productName: '#5 (5/8") Grade 60 Deformed Steel Rebar (20 ft Rod)',
        sku: 'REB-GR60-0520',
        unit: 'per 20ft rod',
        unitPrice: 22.00,
        quantity: 50,
        isPallet: false,
        totalWeightLbs: 1040,
        totalPrice: 1100.00,
        imageUrl: '/src/assets/images/product_steel_rebar_1791194232380.jpg'
      }
    ],
    subtotal: 2432.00,
    contractorDiscount: 243.20,
    freightCost: 240.00,
    tax: 197.80,
    totalAmount: 2626.60,
    totalWeightLbs: 8560,
    status: 'EN_ROUTE',
    statusHistory: [
      {
        status: 'ORDER_PLACED',
        label: 'Order Confirmed',
        description: 'PO verified and material reserved in central staging bay.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        completed: true,
        current: false
      },
      {
        status: 'RIGGING_PACKED',
        label: 'Yard Rigging & Strapping',
        description: '2 pallets of Portland cement & steel bundles strapped and weighed.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        completed: true,
        current: false
      },
      {
        status: 'FREIGHT_DISPATCHED',
        label: 'Flatbed Rig Loaded',
        description: 'Loaded on Freightliner flatbed with onboard Moffett forklift.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        completed: true,
        current: false
      },
      {
        status: 'EN_ROUTE',
        label: 'En Route to Jobsite',
        description: 'Driver dispatched via highway route. ETA approximately 12 mins.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        completed: true,
        current: true
      },
      {
        status: 'DELIVERED',
        label: 'Jobsite Offloading',
        description: 'Unloaded at Gate 4 with contractor signature confirmation.',
        timestamp: '',
        completed: false,
        current: false
      }
    ],
    deliveryDetails: {
      jobsiteName: 'Skyline Commercial Tower - Phase II',
      jobsiteAddress: '742 Evergreen Terr, Sector B',
      gateNumber: 'Gate 4 (South Heavy Freight Entry)',
      siteContactName: 'Marcus Vance (Superintendent)',
      siteContactPhone: '(702) 555-0194',
      unloadingMethod: 'moffett_truck',
      deliveryDate: 'Today, Expedited Priority',
      deliveryTimeWindow: '08:30 AM - 10:00 AM',
      freightTier: 'heavy_freight_boom',
      freightCost: 240.00
    },
    carrierInfo: {
      name: 'LocalWork Heavy Logistics Fleet #FL-402',
      vehicle: 'Freightliner M2 106 Flatbed Crane Rig',
      driverName: 'Dave Kowalski (Class A CDL)',
      driverPhone: '(702) 555-0721',
      licensePlate: 'COMM-9284-NV',
      gpsCoordinates: { lat: 36.1699, lng: -115.1398 },
      currentProgressPct: 78,
      etaMinutes: 12
    },
    stripePaymentId: 'pi_3LW98241_sim_stripe_contractor',
    paymentMethod: 'Stripe Card (Visa •••• 4242)',
    paidAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    userId: 'usr-contractor-01',
    orderId: 'ord-lw-98241',
    title: 'Flatbed Freight Dispatched',
    message: 'Your order #LW-98241 (8,560 lbs of Portland Cement & Steel Rebar) has left the depot with driver Dave Kowalski.',
    type: 'dispatch',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'notif-02',
    userId: 'usr-contractor-01',
    orderId: 'ord-lw-98241',
    title: 'Approaching Jobsite Gate 4',
    message: 'Flatbed Rig #FL-402 is 12 minutes away from Skyline Tower Phase II. Please ensure heavy forklift corridor is clear.',
    type: 'order_status',
    read: false,
    createdAt: new Date(Date.now() - 900000).toISOString()
  }
];

class Database {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading database file, resetting to initial seed:', err);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      notifications: INITIAL_NOTIFICATIONS
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing database file:', err);
    }
  }

  public getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'featured';
  }): Product[] {
    let result = [...this.schema.products];

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.astmStandard && p.astmStandard.toLowerCase().includes(q))
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.inStockOnly) {
      result = result.filter(p => p.inStock && p.stockQuantity > 0);
    }

    if (filters?.sort) {
      if (filters.sort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else {
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.schema.products.find(p => p.id === id);
  }

  public createProduct(product: Omit<Product, 'id'>): Product {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...product, id };
    this.schema.products.unshift(newProduct);
    this.save(this.schema);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.schema.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.schema.products[index] = { ...this.schema.products[index], ...updates };
    this.save(this.schema);
    return this.schema.products[index];
  }

  public getUsers(): User[] {
    return this.schema.users;
  }

  public findUserByEmail(email: string): User | undefined {
    return this.schema.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  public createUser(userData: Omit<User, 'id'>): User {
    const id = `usr-${Date.now()}`;
    const newUser: User = { ...userData, id };
    this.schema.users.push(newUser);
    this.save(this.schema);
    return newUser;
  }

  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.schema.orders.filter(o => o.userId === userId);
    }
    return this.schema.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.schema.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LW-${randomNum}`;
    const id = `ord-lw-${randomNum}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now
    };

    this.schema.orders.unshift(newOrder);

    // Create initial push notification
    this.createNotification({
      userId: newOrder.userId,
      orderId: newOrder.id,
      title: `Order ${newOrder.orderNumber} Confirmed`,
      message: `Your construction supply order of ${newOrder.totalWeightLbs.toLocaleString()} lbs has been received and scheduled for freight rigging.`,
      type: 'order_status',
      read: false
    });

    this.save(this.schema);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, nextStatus: OrderStatus, customMessage?: string): { order: Order; notification: NotificationItem } | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const stages: { status: OrderStatus; label: string; desc: string }[] = [
      { status: 'ORDER_PLACED', label: 'Order Confirmed', desc: 'Material allocation verified and reserved.' },
      { status: 'RIGGING_PACKED', label: 'Yard Rigging & Strapping', desc: 'Materials strapped to pallets and weighed.' },
      { status: 'FREIGHT_DISPATCHED', label: 'Flatbed Rig Loaded', desc: 'Rigged onto flatbed truck with Moffett offloader.' },
      { status: 'EN_ROUTE', label: 'En Route to Jobsite', desc: 'Truck dispatched and traveling with live GPS tracking.' },
      { status: 'DELIVERED', label: 'Delivered & Offloaded', desc: 'Unloaded at jobsite with foreman signature confirmation.' }
    ];

    const currentStageIndex = stages.findIndex(s => s.status === nextStatus);
    const now = new Date().toISOString();

    order.status = nextStatus;
    order.updatedAt = now;

    // Update status history
    order.statusHistory = stages.map((stage, idx) => {
      const completed = idx <= currentStageIndex;
      const isCurrent = idx === currentStageIndex;
      const existing = order.statusHistory.find(h => h.status === stage.status);
      return {
        status: stage.status,
        label: stage.label,
        description: isCurrent && customMessage ? customMessage : (existing?.description || stage.desc),
        timestamp: completed ? (existing?.timestamp && existing.completed ? existing.timestamp : now) : '',
        completed,
        current: isCurrent
      };
    });

    if (nextStatus === 'DELIVERED') {
      order.carrierInfo.currentProgressPct = 100;
      order.carrierInfo.etaMinutes = 0;
    } else if (nextStatus === 'EN_ROUTE') {
      order.carrierInfo.currentProgressPct = 75;
      order.carrierInfo.etaMinutes = 14;
    } else if (nextStatus === 'FREIGHT_DISPATCHED') {
      order.carrierInfo.currentProgressPct = 35;
      order.carrierInfo.etaMinutes = 35;
    } else if (nextStatus === 'RIGGING_PACKED') {
      order.carrierInfo.currentProgressPct = 15;
      order.carrierInfo.etaMinutes = 60;
    }

    const notification = this.createNotification({
      userId: order.userId,
      orderId: order.id,
      title: `Order ${order.orderNumber}: ${stages[currentStageIndex]?.label || nextStatus}`,
      message: customMessage || `Status update: ${stages[currentStageIndex]?.desc}`,
      type: nextStatus === 'DELIVERED' ? 'delivery' : (nextStatus === 'FREIGHT_DISPATCHED' ? 'dispatch' : 'order_status'),
      read: false
    });

    this.save(this.schema);
    return { order, notification };
  }

  public getNotifications(userId: string): NotificationItem[] {
    return this.schema.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const notification: NotificationItem = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    this.schema.notifications.unshift(notification);
    this.save(this.schema);
    return notification;
  }

  public markNotificationsRead(userId: string): void {
    this.schema.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.save(this.schema);
  }
}

export const db = new Database();
