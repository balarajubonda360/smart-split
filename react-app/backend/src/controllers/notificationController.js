import { store } from '../data/mockData.js';
import { successResponse } from '../utils/response.js';
import { emitSocketEvent } from '../socket.js';

export const getNotifications = (req, res) => {
  const notifications = store.notifications.filter((notification) => notification.userId === req.user.id || req.user.role === 'PLATFORM_ADMIN');
  return successResponse(res, 'Notifications fetched', { notifications });
};

export const markNotificationRead = (req, res) => {
  const notification = store.notifications.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!notification) {
    return successResponse(res, 'Notification not found', { notification: null }, 404);
  }

  notification.read = true;
  return successResponse(res, 'Notification marked as read', { notification });
};

export const markAllNotificationsRead = (req, res) => {
  store.notifications.forEach((notification) => {
    if (notification.userId === req.user.id) {
      notification.read = true;
    }
  });

  emitSocketEvent('notificationsUpdated', { userId: req.user.id, message: 'All notifications read' }, `user:${req.user.id}`);
  return successResponse(res, 'All notifications marked as read', { count: store.notifications.filter((n) => n.userId === req.user.id && !n.read).length });
};
