import React from 'react';
import { Search, ShieldAlert, Truck, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickCategory: (cat: string) => void;
  onTrackOrderClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onQuickCategory,
  onTrackOrderClick
}) => {
  return (
    <section className="relative overflow-hidden bg-neutral-950 border-b border-neutral-800">
      {/* Background imagery with measured dark contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_construction_depot_1791194199359.jpg"
          alt="LOCALWORK commercial construction supply yard depot"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          {/* Natural human editorial kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-4">
            <span>Direct Mill & Heavy Supply Network</span>
            <span aria-hidden="true">·</span>
            <span>Commercial Jobsite Delivery</span>
            <span aria-hidden="true">·</span>
            <span>ASTM Certified</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase text-balance leading-none mb-6">
            Building Materials Delivered Directly to Your Jobsite Gate
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            LOCALWORK equips general contractors, builders, and trades with mill-direct structural steel, Portland cement, kiln-dried framing lumber, and drywall. Full flatbed freight dispatch with live GPS tracking and instant Stripe checkout.
          </p>

          {/* Quick Search Box */}
          <div className="bg-neutral-900/90 backdrop-blur-md p-2 rounded-xl border border-neutral-700/80 shadow-2xl mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by material (e.g. Portland Cement, #5 Rebar, 2x4 Lumber, ASTM C150)..."
                  className="w-full bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-500 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTrackOrderClick}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>Track Active Order</span>
                </button>
              </div>
            </div>
          </div>

          {/* Fast Category Access Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">Quick Filters:</span>
            {[
              'Masonry & Cement',
              'Framing & Timber',
              'Structural Steel & Rebar',
              'Drywall & Insulation',
              'Tools & Jobsite Gear'
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => onQuickCategory(cat)}
                className="px-2.5 py-1 rounded bg-neutral-850 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
