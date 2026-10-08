import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const LiveUpdates = ({ token, userId }) => {
  const [message, setMessage] = useState('');
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (!token || !userId) return undefined;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: false,
    });
    const notify = (text) => {
      setMessage(text);
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = window.setTimeout(() => setMessage(''), 6000);
    };

    socket.on('paymentUpdated', () => notify('A payment status was updated.'));
    socket.on('notificationCreated', ({ notification }) => notify(notification?.title || 'You have a new notification.'));
    socket.on('notificationsUpdated', () => notify('Your notifications were updated.'));
    socket.on('disputeUpdated', ({ dispute }) => notify(`Dispute update: ${dispute?.status?.replaceAll('_', ' ').toLowerCase() || 'status changed'}.`));
    socket.on('connect_error', () => notify('Live updates are unavailable. Check your connection and refresh to retry.'));
    socket.connect();

    return () => {
      window.clearTimeout(dismissTimer.current);
      socket.disconnect();
    };
  }, [token, userId]);

  if (!message) return null;
  return (
    <div className="live-update-toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={() => { window.clearTimeout(dismissTimer.current); setMessage(''); }} aria-label="Dismiss update">×</button>
    </div>
  );
};
