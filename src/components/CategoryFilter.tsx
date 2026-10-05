import React from 'react';
import { Filter, SlidersHorizontal, Check } from 'lucide-react';
import { BuildingCategory } from '../types.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: { id: string; name: string; count: number }[];
  resultCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  categories,
  resultCount
}) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar: Category tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                (cat.name === 'All Materials' && selectedCategory === 'All');

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name === 'All Materials' ? 'All' : cat.name)}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-750'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary controls: Filter toggles and sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800 text-xs">
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="font-mono text-neutral-200 font-medium">
              {resultCount} {resultCount === 1 ? 'material' : 'materials'} available
            </span>

            <span aria-hidden="true" className="text-neutral-700">|</span>

            {/* In-stock checkbox button */}
            <button
              onClick={() => onToggleInStock(!inStockOnly)}
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  inStockOnly
                    ? 'bg-amber-500 border-amber-500 text-neutral-950'
                    : 'border-neutral-600 bg-neutral-800'
                }`}
              >
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Ready for Immediate Jobsite Dispatch</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-neutral-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="featured">Featured Specifications</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Contractor Rating</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
