/**
 * NotificationCenter Component
 * Full page for viewing notification history with filters and pagination
 */

import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: 'all',
    status: 'all',
    isRead: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.isRead !== 'all' && { isRead: filters.isRead })
      });

      const response = await fetch(`/api/notifications?${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread/count', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Delete this notification?')) {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          fetchNotifications();
        }
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'push': return '🔔';
      case 'in_app': return 'ℹ️';
      default: return '📨';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'pending' },
      sent: { label: 'Sent', className: 'sent' },
      delivered: { label: 'Delivered', className: 'delivered' },
      failed: { label: 'Failed', className: 'failed' }
    };
    return statusConfig[status] || { label: status, className: 'default' };
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h1>🔔 Notifications</h1>
        <div className="header-stats">
          <span className="unread-badge">{unreadCount} Unread</span>
          {unreadCount > 0 && (
            <button 
              className="btn-mark-all-read"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notification-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
            <option value="in_app">In-App</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Read Status:</label>
          <select 
            value={filters.isRead}
            onChange={(e) => handleFilterChange('isRead', e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Per Page:</label>
          <select 
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="notification-list-container">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <p>✨ No notifications found</p>
            <small>Check back later for updates!</small>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="card-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="card-content">
                  <div className="content-header">
                    <h3>{notification.subject}</h3>
                    <span className={`status-badge ${getStatusBadge(notification.status).className}`}>
                      {getStatusBadge(notification.status).label}
                    </span>
                  </div>

                  <p className="card-message">{notification.message}</p>

                  <div className="card-meta">
                    <span className="type-badge">{notification.type}</span>
                    <span className="event-type">{notification.eventType}</span>
                    <span className="time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  {!notification.isRead && (
                    <button
                      className="action-btn"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(notification._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            ← Previous
          </button>

          <div className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            ({pagination.totalItems} total)
          </div>

          <button
            className="page-btn"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
