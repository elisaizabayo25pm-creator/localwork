import React, { useState } from 'react';
import { X, Bell, Check, BellRing, Sparkles, AlertCircle, ExternalLink, Volume2 } from 'lucide-react';
import { NotificationItem } from '../types.js';
import { pushService } from '../utils/push.js';
import { soundEffects } from '../utils/audio.js';
import { api } from '../services/api.js';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectOrder: (orderId: string) => void;
  onRefreshNotifs: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectOrder,
  onRefreshNotifs
}) => {
  if (!isOpen) return null;

  const [permissionState, setPermissionState] = useState<NotificationPermission>(pushService.getPermission());
  const [testing, setTesting] = useState(false);

  const handleRequestPermission = async () => {
    const perm = await pushService.requestPermission();
    setPermissionState(perm);
    if (perm === 'granted') {
      pushService.showNotification({
        title: 'LOCALWORK Push Alerts Active',
        body: 'You will receive real-time freight status alerts for your jobsite deliveries.'
      });
    }
  };

  const handleSendTestPush = async () => {
    setTesting(true);
    try {
      // Play audio chime
      soundEffects.playDispatchChime();

      // Show native Web Push Notification
      pushService.showNotification({
        title: 'Jobsite Rig #FL-402 Approaching',
        body: 'Moffett flatbed is 5 minutes from Gate 4. Clear the material staging corridor.',
        tag: 'test-push-alert'
      });

      // Also persist to server
      await api.testPushAlert('usr-contractor-01', 'Jobsite Rig #FL-402 Approaching', 'Moffett flatbed is 5 minutes from Gate 4. Clear the material staging corridor.');
      onRefreshNotifs();
    } catch (err) {
      console.warn('Test push error:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Push Alert Center
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Web Push Permission Panel */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Desktop Web Push Status:</span>
              <span className={`font-mono font-bold uppercase text-[11px] ${
                permissionState === 'granted'
                  ? 'text-emerald-400'
                  : permissionState === 'denied'
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}>
                {permissionState}
              </span>
            </div>

            <div className="flex gap-2">
              {permissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Enable Push Alerts</span>
                </button>
              ) : (
                <div className="flex-1 py-1.5 px-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Desktop Alerts Active</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={testing}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors border border-neutral-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
              <span>Order Logistics Updates ({notifications.length})</span>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={onMarkAllRead}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs">
                No notification alerts currently logged.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.orderId) {
                      onSelectOrder(notif.orderId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !notif.read
                      ? 'bg-neutral-850 border-amber-500/50 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                    {notif.message}
                  </p>

                  {notif.orderId && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-mono">
                      <span>View live order telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
