export type UserRole = 'contractor' | 'subcontractor' | 'project_manager' | 'merchant' | 'homeowner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  contractorLicense?: string;
  phone?: string;
  deliveryAddress?: string;
}

export type BuildingCategory =
  | 'Masonry & Cement'
  | 'Framing & Timber'
  | 'Structural Steel & Rebar'
  | 'Drywall & Insulation'
  | 'Roofing & Waterproofing'
  | 'Plumbing & Drainage'
  | 'Fasteners & Hardware'
  | 'Tools & Jobsite Gear';

export interface Product {
  id: string;
  name: string;
  category: BuildingCategory;
  subcategory: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  unit: string;
  palletPrice?: number;
  palletQuantity?: number;
  minOrderQty: number;
  weightLbs: number;
  astmStandard?: string;
  stockQuantity: number;
  inStock: boolean;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  specifications: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isPallet: boolean;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'RIGGING_PACKED'
  | 'FREIGHT_DISPATCHED'
  | 'EN_ROUTE'
  | 'DELIVERED';

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface DeliveryDetails {
  jobsiteName: string;
  jobsiteAddress: string;
  gateNumber: string;
  siteContactName: string;
  siteContactPhone: string;
  unloadingMethod: 'forklift_on_site' | 'boom_crane_required' | 'tailgate_hand_unload' | 'moffett_truck';
  deliveryDate: string;
  deliveryTimeWindow: string;
  freightTier: 'standard_courier' | 'flatbed_truck' | 'heavy_freight_boom';
  freightCost: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  isPallet: boolean;
  totalWeightLbs: number;
  totalPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  companyName?: string;
  items: OrderItem[];
  subtotal: number;
  contractorDiscount: number;
  freightCost: number;
  tax: number;
  totalAmount: number;
  totalWeightLbs: number;
  status: OrderStatus;
  statusHistory: TrackingStep[];
  deliveryDetails: DeliveryDetails;
  carrierInfo: {
    name: string;
    vehicle: string;
    driverName: string;
    driverPhone: string;
    licensePlate: string;
    gpsCoordinates?: { lat: number; lng: number };
    currentProgressPct: number;
    etaMinutes: number;
  };
  stripePaymentId: string;
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order_status' | 'dispatch' | 'delivery' | 'inventory' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
  breakdown: {
    subtotal: number;
    discount: number;
    freight: number;
    tax: number;
    total: number;
    totalWeightLbs: number;
  };
}
