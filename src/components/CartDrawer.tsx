import React from 'react';
import { X, Trash2, ArrowRight, Truck, Scale, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, isPallet: boolean) => void;
  onRemoveItem: (productId: string, isPallet: boolean) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.isPallet && item.product.palletPrice
      ? item.product.palletPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalWeightLbs = items.reduce((sum, item) => {
    const weight = item.isPallet && item.product.palletQuantity
      ? item.product.weightLbs * item.product.palletQuantity
      : item.product.weightLbs;
    return sum + weight * item.quantity;
  }, 0);

  // 10% Trade discount for contractors on orders over $1,000
  const contractorDiscount = subtotal > 1000 ? subtotal * 0.10 : 0;

  // Logistics freight estimation
  let freightTier = 'Standard Courier Van ($45)';
  let freightCost = 45;
  if (totalWeightLbs > 2000) {
    freightTier = 'Heavy Flatbed Boom Truck with Moffett Offload ($240)';
    freightCost = 240;
  } else if (totalWeightLbs > 500) {
    freightTier = 'Medium Freight Stake-bed ($120)';
    freightCost = 120;
  }

  const tax = (subtotal - contractorDiscount) * 0.0825;
  const estimatedTotal = subtotal - contractorDiscount + (items.length > 0 ? freightCost : 0) + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Jobsite Freight Cart
              </span>
              <span className="text-xs font-mono text-neutral-400">({totalItems} items)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Freight Weight Gauge */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span>Payload Weight:</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">{totalWeightLbs.toLocaleString()} lbs</span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{freightTier}</span>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <Truck className="w-12 h-12 text-neutral-700 mb-3" />
                <p className="font-medium text-white mb-1">Your cart is empty</p>
                <p className="text-xs text-neutral-500 mb-4">
                  Select building materials, steel rebar, or cement from the catalog to schedule freight delivery.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price = item.isPallet && item.product.palletPrice
                  ? item.product.palletPrice
                  : item.product.price;
                const itemTotal = price * item.quantity;
                const weight = item.isPallet && item.product.palletQuantity
                  ? item.product.weightLbs * item.product.palletQuantity
                  : item.product.weightLbs;

                return (
                  <div key={`${item.product.id}-${item.isPallet}`} className="py-4 flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg bg-neutral-950 border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-amber-500 uppercase font-semibold">
                        {item.isPallet ? 'Full Pallet Tier' : 'Single Unit'}
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-neutral-400 font-mono mb-2">
                        ${price.toFixed(2)} · {weight * item.quantity} lbs
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-800 rounded bg-neutral-950">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.isPallet)}
                            className="px-2 py-0.5 text-neutral-400 hover:text-white text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs px-2">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.isPallet)}
                            className="px-2 py-0.5 text-neutral-400 hover:text-white text-xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-white">
                            ${itemTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.isPallet)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="p-5 bg-neutral-950 border-t border-neutral-800 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Materials Subtotal:</span>
                  <span className="font-mono text-neutral-200">${subtotal.toFixed(2)}</span>
                </div>
                {contractorDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Contractor Volume Discount (10%):</span>
                    <span className="font-mono">-${contractorDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Freight Delivery & Rigging:</span>
                  <span className="font-mono text-neutral-200">${freightCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Sales Tax (8.25%):</span>
                  <span className="font-mono text-neutral-200">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                  <span>Total (USD):</span>
                  <span className="font-mono text-amber-400 text-lg">${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-display font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Proceed to Stripe Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit Encrypted Jobsite Stripe Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
