import React, { useEffect } from 'react';
import { Truck, X, ExternalLink, BellRing } from 'lucide-react';
import { NotificationItem } from '../types.js';

interface PushNotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onViewOrder: (orderId: string) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onViewOrder
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-neutral-900 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl animate-bounce-short text-neutral-100 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Jobsite Push Alert
            </span>
            <button
              onClick={onDismiss}
              className="text-neutral-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-white mb-1 leading-snug">
            {notification.title}
          </h4>

          <p className="text-xs text-neutral-300 leading-relaxed mb-2.5">
            {notification.message}
          </p>

          {notification.orderId && (
            <button
              onClick={() => {
                onViewOrder(notification.orderId!);
                onDismiss();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Live Delivery</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
