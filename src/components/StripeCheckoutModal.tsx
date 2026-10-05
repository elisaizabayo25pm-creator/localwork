import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle2, AlertCircle, Truck, Building2, User as UserIcon, Phone, MapPin, Sparkles } from 'lucide-react';
import { CartItem, User, Order } from '../types.js';
import { api } from '../services/api.js';
import { soundEffects } from '../utils/audio.js';
import { pushService } from '../utils/push.js';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onPaymentSuccess: (order: Order) => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onPaymentSuccess
}) => {
  if (!isOpen) return null;

  // Form states
  const [jobsiteName, setJobsiteName] = useState('Skyline Tower - Phase II');
  const [jobsiteAddress, setJobsiteAddress] = useState(user?.deliveryAddress || '742 Evergreen Terr, Gate 4, Sector B');
  const [gateNumber, setGateNumber] = useState('Gate 4 (Freight Entrance)');
  const [siteContactName, setSiteContactName] = useState(user?.name || 'Marcus Vance');
  const [siteContactPhone, setSiteContactPhone] = useState(user?.phone || '(702) 555-0194');
  const [unloadingMethod, setUnloadingMethod] = useState<'moffett_truck' | 'forklift_on_site' | 'boom_crane_required' | 'tailgate_hand_unload'>('moffett_truck');

  // Stripe card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('89101');
  const [paymentType, setPaymentType] = useState<'card' | 'net30'>('card');

  // Payment execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);

  // Initialize Payment Intent
  useEffect(() => {
    let isMounted = true;
    async function initIntent() {
      setLoadingIntent(true);
      setErrorMsg(null);
      try {
        const intent = await api.createPaymentIntent({
          items,
          deliveryDetails: { jobsiteName, jobsiteAddress, gateNumber, unloadingMethod },
          isNet30: paymentType === 'net30'
        });
        if (isMounted) {
          setPaymentIntent(intent);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message || 'Failed to initialize Stripe Payment Intent');
      } finally {
        if (isMounted) setLoadingIntent(false);
      }
    }

    initIntent();
    return () => {
      isMounted = false;
    };
  }, [items, paymentType]);

  const handleFillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('842');
    setCardZip('89101');
    setErrorMsg(null);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentIntent) return;

    if (paymentType === 'card' && (!cardNumber || cardNumber.length < 16 || !cardExpiry || !cardCvc)) {
      setErrorMsg('Please enter a complete 16-digit card number, expiration, and CVC (or click Fill Test Card).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Simulate realistic Stripe API roundtrip delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderPayload = {
        userId: user?.id || 'usr-contractor-01',
        customerName: siteContactName,
        customerEmail: user?.email || 'contractor@localwork.build',
        companyName: user?.companyName || 'Vance Commercial Builders LLC',
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          unit: item.product.unit,
          unitPrice: item.isPallet && item.product.palletPrice ? item.product.palletPrice : item.product.price,
          quantity: item.quantity,
          isPallet: item.isPallet,
          totalWeightLbs: (item.isPallet && item.product.palletQuantity ? item.product.weightLbs * item.product.palletQuantity : item.product.weightLbs) * item.quantity,
          totalPrice: (item.isPallet && item.product.palletPrice ? item.product.palletPrice : item.product.price) * item.quantity,
          imageUrl: item.product.imageUrl
        })),
        subtotal: paymentIntent.breakdown.subtotal,
        contractorDiscount: paymentIntent.breakdown.discount,
        freightCost: paymentIntent.breakdown.freight,
        tax: paymentIntent.breakdown.tax,
        totalAmount: paymentIntent.breakdown.total,
        totalWeightLbs: paymentIntent.breakdown.totalWeightLbs,
        deliveryDetails: {
          jobsiteName,
          jobsiteAddress,
          gateNumber,
          siteContactName,
          siteContactPhone,
          unloadingMethod,
          deliveryDate: 'Today, Scheduled Expedited',
          deliveryTimeWindow: 'Within 2 Hours',
          freightTier: paymentIntent.breakdown.totalWeightLbs > 2000 ? 'heavy_freight_boom' : 'flatbed_truck',
          freightCost: paymentIntent.breakdown.freight
        }
      };

      const result = await api.confirmStripePayment({
        paymentIntentId: paymentIntent.id,
        paymentMethod: paymentType === 'net30' ? 'Commercial Net-30 Invoiced' : `Stripe Card (${cardNumber.slice(-4) || '4242'})`,
        orderData: orderPayload
      });

      // Play success chime
      soundEffects.playPaymentChime();

      // Trigger Web Push Notification
      pushService.showNotification({
        title: `Order ${result.order.orderNumber} Confirmed!`,
        body: `Payment authorized via Stripe. ${result.order.totalWeightLbs.toLocaleString()} lbs scheduled for flatbed freight rigging.`
      });

      setIsProcessing(false);
      onPaymentSuccess(result.order);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing failed. Please verify card credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Stripe Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/80 border border-indigo-700/60 rounded text-indigo-400 font-bold text-xs tracking-wider">
              <span>STRIPE</span>
              <span className="text-[10px] text-indigo-300">PAYMENTS</span>
            </div>
            <span className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Secure Jobsite Checkout
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleProcessPayment} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Jobsite Logistics Delivery Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-3">
              <Truck className="w-4 h-4" />
              <span>1. Jobsite Delivery & Freight Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-neutral-400 mb-1">Jobsite Project Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobsiteName}
                    onChange={(e) => setJobsiteName(e.target.value)}
                    placeholder="e.g. Skyline Commercial Center"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Jobsite Address / Sector</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobsiteAddress}
                    onChange={(e) => setJobsiteAddress(e.target.value)}
                    placeholder="742 Evergreen Terr"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Gate / Staging Bay #</label>
                <input
                  type="text"
                  required
                  value={gateNumber}
                  onChange={(e) => setGateNumber(e.target.value)}
                  placeholder="Gate 4 (Heavy Freight)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">On-Site Superintendent / Receiver</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={siteContactName}
                    onChange={(e) => setSiteContactName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Site Contact Direct Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={siteContactPhone}
                    onChange={(e) => setSiteContactPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-400 mb-1">Required Unloading Equipment</label>
                <select
                  value={unloadingMethod}
                  onChange={(e) => setUnloadingMethod(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="moffett_truck">Truck-Mounted Moffett Forklift (Driver Offloads)</option>
                  <option value="forklift_on_site">Jobsite Rough-Terrain Forklift Available On-Site</option>
                  <option value="boom_crane_required">Boom Crane Offloading (Pallets to 2nd Floor / Roof)</option>
                  <option value="tailgate_hand_unload">Tailgate Drop / Ground Delivery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
                <CreditCard className="w-4 h-4" />
                <span>2. Payment Terms & Card Info</span>
              </div>

              <button
                type="button"
                onClick={handleFillTestCard}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Stripe Test Card</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  paymentType === 'card'
                    ? 'bg-neutral-800 border-amber-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Stripe Credit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('net30')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  paymentType === 'net30'
                    ? 'bg-neutral-800 border-amber-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Commercial Net-30 Invoicing
              </button>
            </div>

            {paymentType === 'card' ? (
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-neutral-500">VISA / MC / AMEX</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      Expires
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      placeholder="ZIP"
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs space-y-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved Commercial Credit Line</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Billed to {user?.companyName || 'Vance Commercial Builders LLC'} under account #{user?.contractorLicense || 'GC-NV-9041284'}. Invoice with 30-day payment term generated upon flatbed gate delivery.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Financial Summary & Authorize Button */}
          {paymentIntent && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Materials Subtotal:</span>
                <span className="font-mono text-neutral-200">${paymentIntent.breakdown.subtotal.toFixed(2)}</span>
              </div>
              {paymentIntent.breakdown.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Contractor Trade Discount (10%):</span>
                  <span className="font-mono">-${paymentIntent.breakdown.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Flatbed Freight & Boom Rigging:</span>
                <span className="font-mono text-neutral-200">${paymentIntent.breakdown.freight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Sales Tax (8.25%):</span>
                <span className="font-mono text-neutral-200">${paymentIntent.breakdown.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                <span>Total Authorized Charge:</span>
                <span className="font-mono text-amber-400 text-lg">
                  ${paymentIntent.breakdown.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || loadingIntent}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-display font-extrabold text-base uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Stripe & Scheduling Flatbed...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>
                  {paymentType === 'net30'
                    ? 'Confirm Net-30 Jobsite PO'
                    : `Pay $${paymentIntent?.breakdown.total.toFixed(2) || '0.00'} via Stripe`}
                </span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
