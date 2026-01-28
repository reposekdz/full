/**
 * Notification Utilities
 * Provides toast notifications and alerts across the application
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

class NotificationManager {
  private listeners: Array<(notification: Notification) => void> = [];

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  notify(type: NotificationType, title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      duration,
    };

    this.listeners.forEach((listener) => listener(notification));
  }

  success(title: string, message: string = '', duration?: number) {
    this.notify('success', title, message, duration);
  }

  error(title: string, message: string = '', duration?: number) {
    this.notify('error', title, message, duration);
  }

  warning(title: string, message: string = '', duration?: number) {
    this.notify('warning', title, message, duration);
  }

  info(title: string, message: string = '', duration?: number) {
    this.notify('info', title, message, duration);
  }
}

export const notificationManager = new NotificationManager();

export const notify = {
  success: (title: string, message?: string, duration?: number) =>
    notificationManager.success(title, message || '', duration),
  error: (title: string, message?: string, duration?: number) =>
    notificationManager.error(title, message || '', duration),
  warning: (title: string, message?: string, duration?: number) =>
    notificationManager.warning(title, message || '', duration),
  info: (title: string, message?: string, duration?: number) =>
    notificationManager.info(title, message || '', duration),
};

export const showSuccessToast = (message: string) => {
  notify.success('Success', message);
};

export const showErrorToast = (message: string) => {
  notify.error('Error', message);
};

export const showWarningToast = (message: string) => {
  notify.warning('Warning', message);
};

export const showInfoToast = (message: string) => {
  notify.info('Info', message);
};

export const confirmAction = async (
  message: string,
  title: string = 'Confirm Action'
): Promise<boolean> => {
  return window.confirm(`${title}\n\n${message}`);
};

export const confirmDelete = async (itemName: string): Promise<boolean> => {
  return confirmAction(
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    'Confirm Delete'
  );
};

export const promptInput = async (
  message: string,
  defaultValue: string = '',
  title: string = 'Input Required'
): Promise<string | null> => {
  return window.prompt(`${title}\n\n${message}`, defaultValue);
};

export default notify;
