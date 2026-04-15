/**
 * OrderDetail Component
 * Shows detailed information about a single order
 */

import React, { useState } from 'react';

const OrderDetail = ({ order, onBack, onUpdateStatus, onRefresh }) => {
  const [updatingItems, setUpdatingItems] = useState({});
  const [notes, setNotes] = useState({});

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

  const handleStatusChange = async (itemIndex, newStatus) => {
    try {
      setUpdatingItems({ ...updatingItems, [itemIndex]: true });
      
      await onUpdateStatus(
        order._id,
        itemIndex,
        newStatus,
        notes[itemIndex] || ''
      );

      setNotes({ ...notes, [itemIndex]: '' });
      setUpdatingItems({ ...updatingItems, [itemIndex]: false });
      
      // Refresh the order detail
      setTimeout(() => onRefresh(), 500);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
      setUpdatingItems({ ...updatingItems, [itemIndex]: false });
    }
  };

  return (
    <div className="order-detail-view">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Orders
        </button>
        <h2>{order.orderId}</h2>
      </div>

      <div className="detail-content">
        {/* Order Timeline */}
        <section className="order-section">
          <h3>📅 Order Timeline</h3>
          <div className="timeline">
            <div className="timeline-item">
              <strong>Order Placed:</strong> {formatDate(order.createdAt)}
            </div>
            {order.statusHistory && order.statusHistory.length > 0 && (
              order.statusHistory.map((history, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>Status: {history.status}</strong>
                  <p>
                    {formatDate(history.timestamp)} - {history.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Buyer Information */}
        <section className="order-section">
          <h3>👤 Buyer Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <p>{order.buyer?.username || 'Unknown'}</p>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <p>{order.buyer?.email || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <p>{order.shippingAddress?.phone || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Shipping Information */}
        <section className="order-section">
          <h3>🚚 Shipping Information</h3>
          <div className="shipping-address">
            <p>
              <strong>{order.shippingAddress?.fullName}</strong>
            </p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
            <p>{order.shippingAddress?.pincode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
          {order.trackingNumber && (
            <div className="tracking-info">
              <p>
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </p>
              <p>
                <strong>Carrier:</strong> {order.carrier || 'N/A'}
              </p>
            </div>
          )}
        </section>

        {/* Products */}
        <section className="order-section">
          <h3>📦 Your Products</h3>
          <div className="products-detail">
            {order.items.map((item, idx) => (
              <div key={idx} className="product-detail-card">
                <div className="product-image-section">
                  {item.image && (
                    <img src={item.image} alt={item.name} />
                  )}
                </div>

                <div className="product-info-section">
                  <h4>{item.name}</h4>
                  <p className="description">Quantity: {item.quantity}</p>
                  <p className="price">
                    ₹{item.price} × {item.quantity} = ₹{item.subtotal}
                  </p>

                  <div className="status-management">
                    <h5>Status Management</h5>
                    <div className="current-status">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusBadgeColor(item.sellerStatus)
                        }}
                      >
                        {item.sellerStatus}
                      </span>
                    </div>

                    <div className="status-update-form">
                      <select
                        value={item.sellerStatus}
                        onChange={(e) => {
                          if (e.target.value !== item.sellerStatus) {
                            handleStatusChange(idx, e.target.value);
                          }
                        }}
                        disabled={updatingItems[idx]}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="status-notes">
                      <textarea
                        placeholder="Add a note about this update (optional)"
                        value={notes[idx] || ''}
                        onChange={(e) =>
                          setNotes({ ...notes, [idx]: e.target.value })
                        }
                        rows="2"
                      />
                    </div>

                    {item.sellerStatusHistory && item.sellerStatusHistory.length > 0 && (
                      <div className="status-history">
                        <h6>Status History:</h6>
                        {item.sellerStatusHistory.map((history, hidx) => (
                          <div key={hidx} className="history-item">
                            <p>
                              <strong>{history.status}</strong>
                              <small>
                                {formatDate(history.timestamp)}
                              </small>
                            </p>
                            {history.note && (
                              <p className="note">{history.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="order-section">
          <h3>💰 Order Summary</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{order.pricing?.subtotal || 0}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>₹{order.pricing?.tax || 0}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₹{order.pricing?.shippingCharge || 0}</span>
            </div>
            {order.pricing?.discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-₹{order.pricing?.discountAmount}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{order.pricing?.total || 0}</span>
            </div>
            <div className="summary-row">
              <span>Payment Status:</span>
              <span className="payment-status">{order.paymentStatus}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderDetail;
