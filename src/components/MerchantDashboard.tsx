import React, { useState, useEffect } from 'react';
import { Store, DollarSign, Package, Truck, AlertTriangle, Plus, Check, RefreshCw, BarChart3, ChevronRight, HardHat, FileSpreadsheet } from 'lucide-react';
import { Product, Order, OrderStatus, BuildingCategory } from '../types.js';
import { api } from '../services/api.js';
import { soundEffects } from '../utils/audio.js';
import { pushService } from '../utils/push.js';

interface MerchantDashboardProps {
  orders: Order[];
  products: Product[];
  onRefreshData: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  orders,
  products,
  onRefreshData,
  onSelectOrder
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New product form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BuildingCategory>('Masonry & Cement');
  const [newSku, setNewSku] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPrice, setNewPrice] = useState(19.99);
  const [newUnit, setNewUnit] = useState('per bag');
  const [newWeight, setNewWeight] = useState(80);
  const [newStock, setNewStock] = useState(250);
  const [newAstm, setNewAstm] = useState('ASTM C150');
  const [newPalletPrice, setNewPalletPrice] = useState(720);
  const [newPalletQty, setNewPalletQty] = useState(40);

  const fetchStats = async () => {
    try {
      const data = await api.getMerchantStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load merchant stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [orders, products]);

  const handleDispatchOrder = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await api.advanceOrderStatus(orderId, nextStatus);
      soundEffects.playDispatchChime();
      pushService.showNotification({
        title: `Merchant Operations: ${result.notification.title}`,
        body: result.notification.message
      });
      onRefreshData();
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      await api.addMerchantProduct({
        name: newTitle,
        category: newCategory,
        subcategory: 'Standard Commercial Grade',
        sku: newSku || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: newBrand || 'LocalWork Certified Supply',
        description: `High performance ${newTitle.toLowerCase()} engineered for industrial jobsite applications. Compliant with ${newAstm}.`,
        price: Number(newPrice),
        unit: newUnit,
        palletPrice: Number(newPalletPrice),
        palletQuantity: Number(newPalletQty),
        minOrderQty: 1,
        weightLbs: Number(newWeight),
        astmStandard: newAstm,
        stockQuantity: Number(newStock),
        inStock: Number(newStock) > 0,
        featured: false,
        rating: 5.0,
        reviewCount: 1,
        imageUrl: '/src/assets/images/hero_construction_depot_1791194199359.jpg',
        specifications: {
          'ASTM Standard': newAstm,
          'Unit Weight': `${newWeight} lbs`,
          'Packaging': `${newPalletQty} units per pallet`
        }
      });

      setShowAddProduct(false);
      setNewTitle('');
      onRefreshData();
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Merchant Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
            <Store className="w-4 h-4" />
            <span>LocalWork Merchant Operations · Depot Yard #12</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Construction Supply Storefront Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Building Material</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Gross Supply Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            ${stats ? stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[11px] text-emerald-400">Processed via Stripe Gateway</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Active Flatbed Dispatches</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {stats ? stats.activeDeliveries : 0} Rigs
          </div>
          <span className="text-[11px] text-neutral-400">En route to regional jobsites</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Freight Tonnage Shipped</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {stats ? (stats.totalWeightShipped / 2000).toFixed(1) : 0} Tons
          </div>
          <span className="text-[11px] text-neutral-400">
            {stats ? stats.totalWeightShipped.toLocaleString() : 0} lbs payload
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Active Catalog SKUs</span>
            <HardHat className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {products.length} Products
          </div>
          <span className="text-[11px] text-neutral-400">
            {stats ? stats.lowStock : 0} SKUs low stock
          </span>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
              Contractor Orders & Dispatch Status
            </h3>
            <p className="text-xs text-neutral-400">Click to advance status and notify contractor via push alert</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3.5">Order / PO</th>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">Destination & Gate</th>
                <th className="px-5 py-3.5">Payload Weight</th>
                <th className="px-5 py-3.5">Total (Stripe)</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5 text-right">Merchant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {orders.map((order) => {
                const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
                  ORDER_PLACED: 'RIGGING_PACKED',
                  RIGGING_PACKED: 'FREIGHT_DISPATCHED',
                  FREIGHT_DISPATCHED: 'EN_ROUTE',
                  EN_ROUTE: 'DELIVERED',
                  DELIVERED: null
                };
                const next = nextStatusMap[order.status];

                return (
                  <tr key={order.id} className="hover:bg-neutral-850/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-amber-400">
                      <button
                        onClick={() => onSelectOrder(order.id)}
                        className="hover:underline flex items-center gap-1"
                      >
                        #{order.orderNumber}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-white">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-neutral-400 text-[11px]">{order.companyName}</div>
                    </td>
                    <td className="px-5 py-4 text-neutral-300">
                      <div>{order.deliveryDetails.jobsiteName}</div>
                      <div className="text-neutral-500 text-[11px]">{order.deliveryDetails.gateNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-neutral-300">
                      {order.totalWeightLbs.toLocaleString()} lbs
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-mono font-semibold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.status === 'EN_ROUTE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {next ? (
                        <button
                          onClick={() => handleDispatchOrder(order.id, next)}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded font-semibold text-[11px] uppercase transition-colors"
                        >
                          {updatingId === order.id ? 'Updating...' : `Advance → ${next.replace('_', ' ')}`}
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-[11px]">Completed & Signed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4">
              Add Building Material to Storefront
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Type S Masonry Cement 80lb"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Masonry & Cement">Masonry & Cement</option>
                    <option value="Framing & Timber">Framing & Timber</option>
                    <option value="Structural Steel & Rebar">Structural Steel & Rebar</option>
                    <option value="Drywall & Insulation">Drywall & Insulation</option>
                    <option value="Roofing & Waterproofing">Roofing & Waterproofing</option>
                    <option value="Plumbing & Drainage">Plumbing & Drainage</option>
                    <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                    <option value="Tools & Jobsite Gear">Tools & Jobsite Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">ASTM Certification Standard</label>
                  <input
                    type="text"
                    value={newAstm}
                    onChange={(e) => setNewAstm(e.target.value)}
                    placeholder="ASTM C150 / ASTM A615"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Unit Weight (lbs)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Pallet Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPalletPrice}
                    onChange={(e) => setNewPalletPrice(parseFloat(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Pallet Yield (units)</label>
                  <input
                    type="number"
                    value={newPalletQty}
                    onChange={(e) => setNewPalletQty(parseInt(e.target.value, 10))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg uppercase"
                >
                  Publish to Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
