/**
 * NotificationBell Component
 * Displays notification bell icon with unread count badge
 */

import React, { useState, useEffect, useContext } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unread count on component mount and periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread/count', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Setup real-time updates with socket.io (if available)
    if (window.io) {
      const socket = window.io();
      socket.on('notification:new', (notification) => {
        setUnreadCount(prev => prev + 1);
      });
      
      socket.on('notification:read', (notificationId) => {
        if (unreadCount > 0) {
          setUnreadCount(prev => prev - 1);
        }
      });

      return () => {
        socket.off('notification:new');
        socket.off('notification:read');
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownClose = () => {
    setShowDropdown(false);
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notifications"
        title={`${unreadCount} unread notifications`}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown 
          onClose={handleDropdownClose}
          userId={userId}
          onUnreadChange={(count) => setUnreadCount(count)}
        />
      )}
    </div>
  );
};

/**
 * NotificationDropdown Component
 * Shows recent notifications in a dropdown
 */
function NotificationDropdown({ onClose, userId, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications/unread?limit=5', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
        onUnreadChange(prev => prev - 1);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'push': return '🔔';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="notification-dropdown" onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="dropdown-content">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty">
            <p>✨ All caught up!</p>
            <small>You have no unread notifications</small>
          </div>
        ) : (
          <ul className="notification-list">
            {notifications.map(notification => (
              <li 
                key={notification._id} 
                className="notification-item"
                onClick={() => handleMarkAsRead(notification._id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4>{notification.subject}</h4>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dropdown-footer">
        <a href="/notifications" className="view-all-link">
          View All Notifications →
        </a>
      </div>
    </div>
  );
}

export default NotificationBell;
