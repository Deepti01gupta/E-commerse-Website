/**
 * OrdersList Component
 * Displays orders in a table/card format with quick actions
 */

import React, { useState } from 'react';

const OrdersList = ({ orders, onSelectOrder, onUpdateStatus, loading }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#4169E1',
      shipped: '#1E90FF',
      delivered: '#32CD32'
    };
    return colors[status] || '#808080';
  };

  const handleStatusChange = async (orderId, itemIndex, newStatus) => {
    try {
      await onUpdateStatus(orderId, itemIndex, newStatus);
      alert(`Status updated to ${newStatus}!`);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No orders found</p>
        <p>You don't have any orders matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="orders-list">
      <div className="orders-count">
        <p>Found <strong>{orders.length}</strong> orders</p>
      </div>

      <div className="orders-table">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Products</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className="order-row">
                  <td className="order-id">
                    <strong>{order.orderId}</strong>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="product-count">
                      {order.items.length} item(s)
                    </div>
                  </td>
                  <td>
                    <div className="buyer-info">
                      <p>{order.buyer?.username || 'Unknown'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="status-badge"
                          style={{ backgroundColor: getStatusBadgeColor(item.sellerStatus) }}
                        >
                          {item.sellerStatus}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="total">
                    ₹{order.pricing?.total || 0}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-view"
                      onClick={() => {
                        onSelectOrder(order._id);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="btn-expand"
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order._id ? null : order._id
                        )
                      }
                    >
                      {expandedOrderId === order._id ? '▼' : '▶'}
                    </button>
                  </td>
                </tr>

                {expandedOrderId === order._id && (
                  <tr className="order-expansion">
                    <td colSpan="7">
                      <div className="expansion-content">
                        <div className="items-grid">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="item-card">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="item-image"
                                />
                              )}
                              <div className="item-details">
                                <h4>{item.name}</h4>
                                <p>Qty: {item.quantity}</p>
                                <p className="price">₹{item.price}</p>
                                <div className="status-update">
                                  <label>Update Status:</label>
                                  <select
                                    value={item.sellerStatus}
                                    onChange={(e) =>
                                      handleStatusChange(order._id, idx, e.target.value)
                                    }
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="shipping-info">
                          <h4>Shipping Address:</h4>
                          <p>
                            {order.shippingAddress?.fullName}
                          </p>
                          <p>
                            {order.shippingAddress?.street}
                          </p>
                          <p>
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                            {order.shippingAddress?.pincode}
                          </p>
                          <p>📱 {order.shippingAddress?.phone}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersList;
