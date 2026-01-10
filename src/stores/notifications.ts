import { createStore } from 'solid-js/store';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  duration: number;
}

const [notifications, setNotifications] = createStore<Notification[]>([]);

let idCounter = 0;

const generateId = () => {
  idCounter += 1;
  return `toast-${idCounter}-${Date.now()}`;
};

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = generateId();
  setNotifications((prev) => [...prev, { ...notification, id }]);
  return id;
};

const removeNotification = (id: string) => {
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};

export const toast = {
  show: (notification: Omit<Notification, 'id' | 'duration'> & { duration?: number }) => {
    return addNotification({
      ...notification,
      duration: notification.duration ?? 4000,
    });
  },

  success: (title: string, description?: string, duration?: number) => {
    return addNotification({
      type: 'success',
      title,
      description,
      duration: duration ?? 4000,
    });
  },

  error: (title: string, description?: string, duration?: number) => {
    return addNotification({
      type: 'error',
      title,
      description,
      duration: duration ?? 5000, // Errors stay longer
    });
  },

  warning: (title: string, description?: string, duration?: number) => {
    return addNotification({
      type: 'warning',
      title,
      description,
      duration: duration ?? 4500,
    });
  },

  info: (title: string, description?: string, duration?: number) => {
    return addNotification({
      type: 'info',
      title,
      description,
      duration: duration ?? 4000,
    });
  },

  dismiss: (id: string) => {
    removeNotification(id);
  },

  dismissAll: () => {
    setNotifications([]);
  },
};

export { notifications };
