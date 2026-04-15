/**
 * SellerDashboard Component
 * Complete seller dashboard for viewing and managing orders
 * 
 * Features:
 * - View all orders containing seller's products
 * - Filter by status and date range
 * - Update product status
 * - View detailed order information
 * - Dashboard statistics (revenue, order count, etc.)
 */

import React, { useState, useEffect } from 'react';
import './SellerDashboard.css';
import OrdersList from './components/OrdersList';
import OrderDetail from './components/OrderDetail';
import DashboardStats from './components/DashboardStats';
import StatusFilter from './components/StatusFilter';

const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // orders, stats
  
  // Filter state
  const [filters, setFilters] = useState({
    status: null,
    startDate: null,
    endDate: null,
    page: 1,
    limit: 10
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  /**
   * Fetch orders for the seller
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await fetch(`${apiBaseUrl}/api/seller/orders?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch dashboard statistics
   */
  const fetchStats = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`${apiBaseUrl}/api/seller/dashboard/stats?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single order detail
   */
  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/seller/orders/${orderId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch order detail error:', err);
    }
  };

  /**
   * Update product status in order
   */
  const updateProductStatus = async (orderId, itemIndex, newStatus, note = '') => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/seller/orders/${orderId}/items/${itemIndex}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            note
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh orders
        fetchOrders();
        // Update selected order detail
        if (selectedOrder && selectedOrder._id === orderId) {
          fetchOrderDetail(orderId);
        }
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Update status error:', err);
      throw err;
    }
  };

  /**
   * Apply filters
   */
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1 // Reset to first page when filter changes
    });
  };

  /**
   * Initial fetch on component mount or when filters change
   */
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [filters, activeTab]);

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>📦 Seller Dashboard</h1>
        <p>Manage your orders and track sales</p>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="orders-section">
          <StatusFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div className="orders-container">
              {selectedOrder ? (
                <OrderDetail
                  order={selectedOrder}
                  onBack={() => setSelectedOrder(null)}
                  onUpdateStatus={updateProductStatus}
                  onRefresh={() => fetchOrderDetail(selectedOrder._id)}
                />
              ) : (
                <OrdersList
                  orders={orders}
                  onSelectOrder={fetchOrderDetail}
                  onUpdateStatus={updateProductStatus}
                  loading={loading}
                />
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading statistics...</p>
            </div>
          ) : (
            <DashboardStats stats={stats} filters={filters} />
          )}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
