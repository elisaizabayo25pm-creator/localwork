import { soundEffects } from './audio.js';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private permissionState: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionState = Notification.permission;
    }
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionState = Notification.permission;
    }
    return this.permissionState;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionState = permission;
      return permission;
    } catch (err) {
      console.warn('Error requesting push notification permission:', err);
      return 'denied';
    }
  }

  public showNotification(payload: PushNotificationPayload): boolean {
    // Always play alert sound chime
    soundEffects.playDispatchChime();

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag || `lw-alert-${Date.now()}`,
          data: payload.data
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        // Auto close after 6 seconds
        setTimeout(() => notif.close(), 6000);
        return true;
      } catch (err) {
        console.warn('Native notification creation error:', err);
        return false;
      }
    }

    return false;
  }
}

export const pushService = PushNotificationService.getInstance();
