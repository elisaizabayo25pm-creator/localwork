import React, { useState } from 'react';
import { X, Check, Truck, ShieldCheck, Scale, FileText, ChevronRight } from 'lucide-react';
import { Product } from '../types.js';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, isPallet: boolean) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [isPallet, setIsPallet] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const hasPallet = Boolean(product.palletPrice && product.palletQuantity);
  const currentPrice = isPallet && product.palletPrice ? product.palletPrice : product.price;
  const currentTotal = currentPrice * quantity;
  const totalWeight = isPallet && product.palletQuantity
    ? product.weightLbs * product.palletQuantity * quantity
    : product.weightLbs * quantity;

  const handleAdd = () => {
    onAddToCart(product, quantity, isPallet);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-950/70 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image and fast technical tags */}
        <div className="md:w-1/2 bg-neutral-950 flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-neutral-800">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 mb-6 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Jobsite Certified: {product.astmStandard || 'Industrial Grade Spec'}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Scale className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Freight Weight: {product.weightLbs} lbs / individual unit</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Truck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Available for Direct Flatbed Boom Offloading</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module & Specifications */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-500 mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-white mb-3 leading-snug">
              {product.name}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Technical Specifications Table */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Engineering Specifications
              </h4>
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg divide-y divide-neutral-850 text-xs">
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 px-3">
                    <span className="text-neutral-400">{key}</span>
                    <span className="font-mono text-neutral-200 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pallet Selection */}
            {hasPallet && (
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                  Order Packaging Tier
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPallet(false)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      !isPallet
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs">Single Unit / Piece</div>
                    <div className="font-mono text-sm text-neutral-200">${product.price.toFixed(2)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPallet(true)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isPallet
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-400">Full Pallet (Tier 1)</div>
                    <div className="font-mono text-sm text-neutral-200">${product.palletPrice?.toFixed(2)}</div>
                    <div className="text-[10px] text-neutral-400">{product.palletQuantity} units per pallet</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Bar */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-400">Est. Total Weight:</div>
                <div className="font-mono text-sm text-neutral-200">{totalWeight.toLocaleString()} lbs</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-400 hover:text-white text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-semibold px-2">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-neutral-400 hover:text-white text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-white tabular-nums">
                    ${currentTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`w-full py-3 rounded-xl font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Freight Cart</span>
                </>
              ) : (
                <>
                  <span>Add to Jobsite Order</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
