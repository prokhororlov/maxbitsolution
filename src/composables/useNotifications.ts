import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

let notificationIdCounter = 0;

export const useNotifications = () => {
  const showNotification = (
    message: string,
    type: NotificationType = 'info',
    duration: number = 3000
  ) => {
    const id = `notification-${++notificationIdCounter}`;
    const notification: Notification = {
      id,
      message,
      type,
      duration,
    };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) => {
    return showNotification(message, 'success', duration);
  };

  const error = (message: string, duration?: number) => {
    return showNotification(message, 'error', duration);
  };

  const info = (message: string, duration?: number) => {
    return showNotification(message, 'info', duration);
  };

  const warning = (message: string, duration?: number) => {
    return showNotification(message, 'warning', duration);
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };
};

