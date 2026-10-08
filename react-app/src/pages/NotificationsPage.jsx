import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data.data.notifications || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    notificationService.getAll()
      .then(({ data }) => { if (active) setNotifications(data.data.notifications || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Could not load notifications.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const markRead = async (id) => {
    setSaving(true);
    setError('');
    try {
      await notificationService.markRead(id);
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this notification.');
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    setSaving(true);
    setError('');
    try {
      await notificationService.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update notifications.');
    } finally {
      setSaving(false);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="page-section">
      <div className="page-header">
        <div><div className="eyebrow">Notifications</div><h1>Alert center</h1></div>
        <button type="button" className="secondary-button" onClick={() => void markAllRead()} disabled={saving || !unreadCount}>Mark all read</button>
      </div>

      {error && <div className="notice-box error" role="alert">{error} <button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
      <div className="card-block">
        <ul className="list-block">
          {loading ? <li role="status">Loading notifications…</li> : notifications.length ? notifications.map((notification) => (
            <li key={notification.id}>
              <div><strong>{notification.title}</strong><small>{notification.description}</small><small>{new Date(notification.createdAt).toLocaleString()}</small></div>
              <div className={`badge ${notification.read ? 'green' : 'yellow'}`}>{notification.read ? 'Read' : <button type="button" onClick={() => void markRead(notification.id)} disabled={saving}>Mark read</button>}</div>
            </li>
          )) : <li>No notifications found.</li>}
        </ul>
      </div>
    </div>
  );
};
