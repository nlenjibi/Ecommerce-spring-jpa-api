import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearExpiredNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (type, title, message, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: new Date(),
    };

    set(state => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  clearExpiredNotifications: () => {
    const now = new Date();
    set(state => ({
      notifications: state.notifications.filter(
        notification =>
          !notification.duration ||
          (now.getTime() - notification.createdAt.getTime()) < notification.duration
      ),
    }));
  },
}));
