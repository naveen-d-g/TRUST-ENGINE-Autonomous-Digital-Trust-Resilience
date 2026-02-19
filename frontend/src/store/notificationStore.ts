import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
  autoDismiss?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (message: string, severity: Notification['severity'], autoDismiss?: boolean) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (message: string, severity: Notification['severity'], autoDismiss = true) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      message,
      severity,
      timestamp: Date.now(),
      autoDismiss,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-dismiss after 5 seconds
    if (autoDismiss) {
      setTimeout(() => {
        get().removeNotification(id);
      }, 5000);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Subscribe to event bus notifications
import { eventBus } from '../services/eventBus';
eventBus.on('notification', (data) => {
  useNotificationStore.getState().addNotification(
    data.message,
    data.severity as Notification['severity']
  );
});
