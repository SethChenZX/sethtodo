const NOTIFICATION_PERMISSION_KEY = 'dodo_notification_permission';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showBrowserNotification = (title, body) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      requireInteraction: false
    });

    setTimeout(() => notification.close(), 10000);
    return true;
  } catch (error) {
    console.error('Browser notification error:', error);
    return false;
  }
};

export const checkReminderTime = (deadline, reminderMinutes = 5) => {
  if (!deadline) return false;
  
  const deadlineTime = new Date(deadline).getTime();
  const now = new Date().getTime();
  const reminderTime = deadlineTime - (reminderMinutes * 60 * 1000);
  
  return now >= reminderTime && now <= deadlineTime;
};

export const shouldShowReminder = (todo) => {
  if (!todo) return false;
  if (todo.status !== 'pending') return false;
  if (todo.reminderSent) return false;
  if (!todo.deadline) return false;
  
  return checkReminderTime(todo.deadline, 5);
};
