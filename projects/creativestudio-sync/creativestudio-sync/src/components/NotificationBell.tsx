// Notification bell component for comment notifications
import React, { useState, useEffect } from 'react';
import CollaborationEventEmitter from '../services/collaboration-events';

interface Notification {
  id: string;
  type: 'comment' | 'reply' | 'mention';
  message: string;
  createdAt: number;
  read: boolean;
}

interface NotificationBellProps {
  onNotificationClick: (notificationId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const emitterRef = React.useRef<CollaborationEventEmitter | null>(null);

  useEffect(() => {
    if (!emitterRef.current) {
      emitterRef.current = new CollaborationEventEmitter();
    }

    emitterRef.current.on('notification', handleNotification);

    return () => {
      emitterRef.current?.removeAllListeners();
    };
  }, []);

  const handleNotification = (data: { notification: Notification }) => {
    setNotifications((prev) => {
      const newNotifications = [...prev, data.notification];
      if (!data.notification.read) {
        setUnreadCount((count) => count + 1);
      }
      return newNotifications;
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const bellClass = unreadCount > 0 ? 'bell-button has-notifications' : 'bell-button';

  return (
    <div className='notification-bell'>
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={bellClass}>
        <span className='bell-icon'>🔔</span>
        {unreadCount > 0 && <span className='notification-badge'>{unreadCount}</span>}
      </button>

      {isDropdownOpen && (
        <div className='notification-dropdown'>
          <div className='notification-header'>
            <span>Notifications</span>
            <button onClick={markAllAsRead} className='mark-all-read'>Mark all as read</button>
          </div>
          <div className='notification-list'>
            {notifications.length === 0 ? (
              <p className='no-notifications'>No new notifications</p>
            ) : (
              notifications.map((notification) => {
                const itemClass = !notification.read ? 'notification-item unread' : 'notification-item';
                return (
                  <div key={notification.id} onClick={() => { onNotificationClick(notification.id); markAsRead(notification.id); }} className={itemClass}>
                    <span className='notification-icon'>{getNotificationIcon(notification.type)}</span>
                    <div className='notification-content'>
                      <p>{notification.message}</p>
                      <span className='notification-time'>{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'comment': return '💬';
    case 'reply': return '↩️';
    case 'mention': return '🔔';
    default: return 'ℹ️';
  }
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return new Date(timestamp).toLocaleDateString();
};