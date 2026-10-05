import React from 'react';
import { ShoppingBag, Bell, HardHat, Store, Truck, Search, ShieldCheck, Server } from 'lucide-react';
import { User } from '../types.js';

interface NavbarProps {
  currentView: 'storefront' | 'tracking' | 'merchant';
  onNavigate: (view: 'storefront' | 'tracking' | 'merchant') => void;
  cartCount: number;
  totalCartWeightLbs: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onOpenXampp: () => void;
  onSelectCategory?: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  totalCartWeightLbs,
  onOpenCart,
  onOpenNotifications,
  unreadNotifsCount,
  user,
  onOpenAuth,
  onOpenXampp
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => onNavigate('storefront')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-display font-extrabold text-neutral-950 text-lg tracking-wider group-hover:bg-amber-400 transition-colors">
              LW
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
              LOCALWORK
            </span>
          </button>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onNavigate('storefront')}
            className={`transition-colors hover:text-white ${
              currentView === 'storefront' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Material Catalog
          </button>

          <button
            onClick={() => onNavigate('tracking')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${
              currentView === 'tracking' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Truck className="w-4 h-4 text-amber-500" />
            <span>Jobsite Tracking</span>
          </button>

          <button
            onClick={() => onNavigate('merchant')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${
              currentView === 'merchant' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Store className="w-4 h-4 text-neutral-400" />
            <span>Merchant Yard Ops</span>
          </button>

          <button
            onClick={onOpenXampp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/30 transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Host with XAMPP</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile XAMPP button */}
          <button
            onClick={onOpenXampp}
            title="Deploy to XAMPP"
            className="md:hidden p-2 rounded-lg text-orange-400 hover:bg-neutral-800 transition-colors"
          >
            <Server className="w-4 h-4" />
          </button>

          {/* Push notification center bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Push notifications center"
            className="relative p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-neutral-900 border border-neutral-750 hover:border-neutral-600 rounded-lg text-neutral-100 hover:bg-neutral-850 transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-neutral-950 font-bold rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Freight Cart</span>
            {totalCartWeightLbs > 0 && (
              <span className="text-xs text-neutral-400 font-mono hidden lg:inline">
                ({totalCartWeightLbs.toLocaleString()} lbs)
              </span>
            )}
          </button>

          {/* User profile / Auth trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors whitespace-nowrap"
          >
            <HardHat className="w-4 h-4" />
            <span className="hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
