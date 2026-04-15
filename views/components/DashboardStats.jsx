/**
 * DashboardStats Component
 * Displays seller statistics and analytics
 */

import React from 'react';

const DashboardStats = ({ stats, filters }) => {
  if (!stats) {
    return <div>No statistics available</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="dashboard-stats">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Avg Order Value</h3>
            <p className="metric-value">
              {formatCurrency(
                stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {stats.statusBreakdown && stats.statusBreakdown.length > 0 && (
        <div className="stats-section">
          <h3>📈 Order Status Breakdown</h3>
          <div className="status-breakdown">
            {stats.statusBreakdown.map((statusItem) => (
              <div key={statusItem._id} className="status-item">
                <div className="status-label">
                  <span className="status-name">
                    {statusItem._id.charAt(0).toUpperCase() +
                      statusItem._id.slice(1)}
                  </span>
                  <span className="status-count">{statusItem.count}</span>
                </div>
                <div className="status-bar">
                  <div
                    className={`bar bar-${statusItem._id}`}
                    style={{
                      width: `${
                        (statusItem.count / stats.totalOrders) * 100 || 0
                      }%`
                    }}
                  />
                </div>
                <div className="status-percentage">
                  {(
                    ((statusItem.count / stats.totalOrders) * 100 ||
                      0).toFixed(1)
                  )}
                  %
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats.topProducts && stats.topProducts.length > 0 && (
        <div className="stats-section">
          <h3>⭐ Top 5 Products</h3>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, idx) => (
                  <tr key={idx}>
                    <td className="product-name">{product.productName}</td>
                    <td className="units-sold">{product.totalSold}</td>
                    <td className="revenue">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="avg-price">
                      {formatCurrency(product.revenue / product.totalSold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalOrders === 0 && (
        <div className="empty-stats">
          <p>📭 No data available for the selected period</p>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
