import React, { useState } from 'react';
import { Plus, Check, Info, Package, ShieldCheck, Star } from 'lucide-react';
import { Product } from '../types.js';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, isPallet: boolean) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails
}) => {
  const [isPallet, setIsPallet] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const hasPallet = Boolean(product.palletPrice && product.palletQuantity);
  const currentPrice = isPallet && product.palletPrice ? product.palletPrice : product.price;
  const currentUnit = isPallet && product.palletQuantity
    ? `Pallet of ${product.palletQuantity} (${(product.weightLbs * product.palletQuantity).toLocaleString()} lbs)`
    : product.unit;

  const handleAdd = () => {
    onAddToCart(product, quantity, isPallet);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="group flex flex-col bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
      {/* Product Image Slot */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-[4/3] bg-neutral-950 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {!imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-neutral-900 text-neutral-400 text-center">
            <Package className="w-10 h-10 text-amber-500/80 mb-2" />
            <span className="text-xs font-semibold">{product.name}</span>
          </div>
        )}

        {/* Quiet unboxed stock status */}
        <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-neutral-300 border border-neutral-800">
          {product.inStock ? `${product.stockQuantity} in yard` : 'Special Order'}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5 uppercase font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-500/90">{product.brand}</span>
          </div>

          <h3
            onClick={() => onOpenDetails(product)}
            className="font-display text-base font-semibold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {product.name}
          </h3>

          {/* ASTM & Weight line */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 font-mono">
            {product.astmStandard && (
              <>
                <span className="text-neutral-300">{product.astmStandard.split('/')[0]}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{product.weightLbs} lbs / unit</span>
          </div>
        </div>

        <div>
          {/* Pallet / Unit Segmented Control if pallet available */}
          {hasPallet && (
            <div className="flex items-center p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setIsPallet(false)}
                className={`flex-1 py-1 rounded-md text-center transition-colors font-medium ${
                  !isPallet
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Piece / Unit
              </button>
              <button
                type="button"
                onClick={() => setIsPallet(true)}
                className={`flex-1 py-1 rounded-md text-center transition-colors font-medium ${
                  isPallet
                    ? 'bg-amber-500 text-neutral-950 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Full Pallet (-10%)
              </button>
            </div>
          )}

          {/* Price & Add to Cart Controls */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-lg font-bold text-white tabular-nums">
                ${currentPrice.toFixed(2)}
              </div>
              <div className="text-[11px] text-neutral-400 truncate max-w-[140px]">
                {currentUnit}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetails(product)}
                aria-label="View material specs"
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Allocated</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
