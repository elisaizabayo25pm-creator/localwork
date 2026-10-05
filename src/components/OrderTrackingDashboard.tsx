import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, Phone, ShieldCheck, ChevronRight, Play, RefreshCw, AlertTriangle, Package, FileText, ArrowLeft, Radio } from 'lucide-react';
import { Order, OrderStatus } from '../types.js';
import { api } from '../services/api.js';
import { pushService } from '../utils/push.js';
import { soundEffects } from '../utils/audio.js';

interface OrderTrackingDashboardProps {
  orders: Order[];
  activeOrderId?: string;
  onSelectOrder: (orderId: string) => void;
  onBackToCatalog: () => void;
  onRefreshOrders: () => void;
}

export const OrderTrackingDashboard: React.FC<OrderTrackingDashboardProps> = ({
  orders,
  activeOrderId,
  onSelectOrder,
  onBackToCatalog,
  onRefreshOrders
}) => {
  const currentOrder = orders.find(o => o.id === activeOrderId || o.orderNumber === activeOrderId) || orders[0];
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showBOL, setShowBOL] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);

  // Status mapping
  const statusLabels: Record<OrderStatus, string> = {
    ORDER_PLACED: 'Order Placed & Cleared',
    RIGGING_PACKED: 'Warehouse Rigging & Pallet Strapping',
    FREIGHT_DISPATCHED: 'Loaded onto Flatbed & Axle Weighed',
    EN_ROUTE: 'En Route to Jobsite (Live GPS)',
    DELIVERED: 'Delivered & Moffett Offloaded'
  };

  const statusProgressPct: Record<OrderStatus, number> = {
    ORDER_PLACED: 15,
    RIGGING_PACKED: 35,
    FREIGHT_DISPATCHED: 60,
    EN_ROUTE: 85,
    DELIVERED: 100
  };

  const handleAdvanceStatus = async (specificStatus?: OrderStatus) => {
    if (!currentOrder) return;
    setIsAdvancing(true);

    try {
      const result = await api.advanceOrderStatus(currentOrder.id, specificStatus);
      // Play dispatcher audio chime
      soundEffects.playDispatchChime();

      // Trigger Web Push Notification
      pushService.showNotification({
        title: result.notification.title,
        body: result.notification.message,
        tag: `order-update-${currentOrder.orderNumber}`
      });

      onRefreshOrders();
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Auto simulation loop
  useEffect(() => {
    let interval: any;
    if (autoSimulate && currentOrder && currentOrder.status !== 'DELIVERED') {
      interval = setInterval(() => {
        handleAdvanceStatus();
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSimulate, currentOrder]);

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Truck className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Jobsite Orders Found</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Submit an order for construction materials to activate live freight logistics tracking.
        </p>
        <button
          onClick={onBackToCatalog}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentPct = statusProgressPct[currentOrder.status] || 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Active Order Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Material Catalog</span>
        </button>

        {/* Order Selector */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Track Order:</span>
            <select
              value={currentOrder.id}
              onChange={(e) => onSelectOrder(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-mono text-xs"
            >
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  #{ord.orderNumber} - {ord.deliveryDetails.jobsiteName} ({ord.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Order Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-3 text-xs mb-2">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold rounded">
                ORDER #{currentOrder.orderNumber}
              </span>
              <span className="text-neutral-400 font-medium">
                Destination: {currentOrder.deliveryDetails.jobsiteName}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {statusLabels[currentOrder.status]}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Jobsite Freight Gate: {currentOrder.deliveryDetails.gateNumber} · Delivery Weight: {currentOrder.totalWeightLbs.toLocaleString()} lbs
            </p>
          </div>

          {/* Quick Simulation & Live Demo Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <div className="text-[11px] text-neutral-400 mr-1 hidden sm:block">
              <span className="text-amber-400 font-semibold block">Interactive Test Controls</span>
              <span>Test push alerts & live tracking</span>
            </div>

            <button
              onClick={() => handleAdvanceStatus()}
              disabled={isAdvancing || currentOrder.status === 'DELIVERED'}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isAdvancing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Advance Next Stage</span>
            </button>

            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-colors ${
                autoSimulate
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-neutral-900 border-neutral-750 text-neutral-300 hover:text-white'
              }`}
            >
              {autoSimulate ? 'Auto-Simulating (7s)' : 'Auto-Run Sim'}
            </button>

            <button
              onClick={() => setShowBOL(!showBOL)}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-850"
              title="View Bill of Lading"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Stage Live Dispatch Timeline */}
        <div className="pt-8">
          <div className="relative mb-6">
            {/* Background track line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-neutral-950 rounded-full" />
            {/* Animated active progress line */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentPct}%` }}
            />

            {/* Stage nodes */}
            <div className="relative flex justify-between">
              {currentOrder.statusHistory.map((step, idx) => {
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <button
                      onClick={() => handleAdvanceStatus(step.status)}
                      title={`Jump to ${step.label}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.completed
                          ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold'
                          : step.current
                          ? 'bg-neutral-900 border-amber-400 text-amber-400 ring-4 ring-amber-500/20'
                          : 'bg-neutral-950 border-neutral-750 text-neutral-600'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <span className="font-mono text-xs">{idx + 1}</span>
                      )}
                    </button>
                    <span className="text-[11px] font-medium text-neutral-300 mt-2 text-center max-w-[80px] hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Stage Highlight Card */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="font-semibold text-white">Live Logistics Telemetry: </span>
                <span className="text-neutral-300">
                  {currentOrder.statusHistory.find(s => s.current)?.description || 'Fleet dispatched and moving.'}
                </span>
              </div>
            </div>
            {currentOrder.status === 'EN_ROUTE' && (
              <div className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 whitespace-nowrap">
                ETA: ~{currentOrder.carrierInfo.etaMinutes} minutes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Interactive Dispatch Map & Carrier Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Animated Route Map */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                Live Freight GPS Corridor
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Telemetry Active</span>
            </div>
          </div>

          {/* Interactive SVG Jobsite Dispatch Map */}
          <div className="relative aspect-[16/9] w-full bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center p-4">
            {/* Visual Grid Lines */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#amber-500_1px,transparent_1px)] [background-size:16px_16px]" />

            <svg viewBox="0 0 600 300" className="w-full h-full">
              {/* Highway Route Path */}
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              <path
                d="M 60 220 Q 200 240, 280 160 T 520 80"
                fill="none"
                stroke="#262626"
                strokeWidth="10"
                strokeLinecap="round"
              />

              <path
                d="M 60 220 Q 200 240, 280 160 T 520 80"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Waypoint 1: Supply Depot */}
              <g transform="translate(60, 220)">
                <circle r="14" fill="#171717" stroke="#f59e0b" strokeWidth="3" />
                <text x="0" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="10" fontFamily="sans-serif">
                  LocalWork Yard #12
                </text>
              </g>

              {/* Waypoint 2: Jobsite Destination */}
              <g transform="translate(520, 80)">
                <circle r="16" fill="#171717" stroke="#10b981" strokeWidth="3" />
                <text x="0" y="-22" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  {currentOrder.deliveryDetails.gateNumber}
                </text>
                <text x="0" y="32" textAnchor="middle" fill="#a3a3a3" fontSize="10" fontFamily="sans-serif">
                  {currentOrder.deliveryDetails.jobsiteName}
                </text>
              </g>

              {/* Moving Flatbed Truck Marker */}
              {(() => {
                const pct = currentOrder.status === 'DELIVERED' ? 1.0 : (currentPct / 100);
                // Approximate coordinate along quadratic spline
                const x = 60 + pct * (520 - 60);
                const y = 220 - Math.sin(pct * Math.PI) * 40 - pct * 140;

                return (
                  <g transform={`translate(${x}, ${y})`} className="transition-all duration-700 ease-out">
                    <circle r="20" fill="#f59e0b" fillOpacity="0.25" className="animate-ping" />
                    <circle r="12" fill="#f59e0b" stroke="#000" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">
                      🚛
                    </text>
                    <rect x="-35" y="-28" width="70" height="16" rx="3" fill="#0a0a0a" stroke="#404040" strokeWidth="1" />
                    <text x="0" y="-17" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      RIG #FL-402
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Bottom telemetry overlay badge */}
            <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300">
              <span>Speed: 42 MPH</span> · <span>Temp: 74°F</span> · <span>Axles: 3</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
            <span>Staging Bay: Terminal 4, Berth 2B</span>
            <span>Unloading Clearance: Moffett Forklift Deployed</span>
          </div>
        </div>

        {/* Right Col: Carrier & Driver Profile */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider mb-4">
              Assigned Heavy Rig & Driver
            </h3>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-display font-bold text-amber-400 text-lg">
                  DK
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {currentOrder.carrierInfo.driverName}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Master Rigging Specialist · 5.0 ★
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-850 space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Rig Vehicle:</span>
                  <span className="text-neutral-200 font-medium">{currentOrder.carrierInfo.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span>License Plate:</span>
                  <span className="font-mono text-neutral-200">{currentOrder.carrierInfo.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatcher Fleet:</span>
                  <span className="text-neutral-200">{currentOrder.carrierInfo.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${currentOrder.carrierInfo.driverPhone}`}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-700"
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Call Jobsite Rig Driver ({currentOrder.carrierInfo.driverPhone})</span>
              </a>
            </div>
          </div>

          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
            <span className="text-neutral-400 font-medium block">Jobsite Delivery Instructions:</span>
            <p className="text-neutral-300 leading-relaxed">
              Report directly to Gate 4. Forklift corridor must have 14ft clearance. Contact superintendent {currentOrder.deliveryDetails.siteContactName} at {currentOrder.deliveryDetails.siteContactPhone} upon crossing perimeter.
            </p>
          </div>
        </div>
      </div>

      {/* Bill of Lading & Order Summary Modal / Accordion */}
      {showBOL && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                Uniform Jobsite Bill of Lading (BOL)
              </h3>
              <p className="text-xs text-neutral-400 font-mono">Document #BOL-{currentOrder.orderNumber}-REV2</p>
            </div>
            <button
              onClick={() => setShowBOL(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="divide-y divide-neutral-800 text-xs">
            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{item.productName}</div>
                  <div className="text-neutral-400 font-mono">
                    SKU: {item.sku} · {item.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-neutral-200">Qty: {item.quantity} ({item.totalWeightLbs.toLocaleString()} lbs)</div>
                  <div className="font-mono font-semibold text-amber-400">${item.totalPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-between font-mono text-sm font-bold text-white">
            <span>Total Certified Payload:</span>
            <span className="text-amber-400">{currentOrder.totalWeightLbs.toLocaleString()} lbs · ${currentOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
