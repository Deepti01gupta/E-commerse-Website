/**
 * StatusFilter Component
 * Filter orders by status and date range
 */

import React, { useState } from 'react';

const StatusFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || ''
  });

  const handleStatusChange = (e) => {
    const newStatus = e.target.value || null;
    setLocalFilters({ ...localFilters, status: newStatus });
    onFilterChange({ ...localFilters, status: newStatus });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...localFilters, [name]: value || null };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    setLocalFilters({
      status: '',
      startDate: '',
      endDate: ''
    });
    onFilterChange({
      status: null,
      startDate: null,
      endDate: null
    });
  };

  return (
    <div className="status-filter">
      <h3>🔍 Filter Orders</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="status-select">Status:</label>
          <select
            id="status-select"
            value={localFilters.status || ''}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            name="startDate"
            value={localFilters.startDate || ''}
            onChange={handleDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            name="endDate"
            value={localFilters.endDate || ''}
            onChange={handleDateChange}
          />
        </div>

        <button className="btn-reset" onClick={handleReset}>
          🔄 Reset Filters
        </button>
      </div>
    </div>
  );
};

export default StatusFilter;
