import React, { useState } from "react";
import CauNav from "../../components/CauNav";
import "./couriers.css"
const CourierIndex = () => {
  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        
        {/* Header Section */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Sendit Courier Dashboard</h1>
          <p className="dashboard-subtitle">Manage your deliveries, earnings, and performance in one place.</p>
        </header>

        {/* Dashboard Stats */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <h3 className="stat-title">Total Earnings</h3>
            <p className="stat-value">KES 50,000</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Deliveries Completed</h3>
            <p className="stat-value">120</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Ongoing Deliveries</h3>
            <p className="stat-value">3</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <button className="action-btn">📦 Start a New Delivery</button>
          <button className="action-btn">💰 Withdraw Earnings</button>
          <button className="action-btn">📜 View Delivery History</button>
        </section>

        {/* Delivery Performance Stats */}
        <section className="delivery-performance">
          <h2 className="section-title">📊 Delivery Statistics</h2>
          <div className="performance-grid">
            <p><strong>🛣️ Total Distance Covered:</strong> 1,200 km</p>
            <p><strong>📦 Active Deliveries:</strong> 3</p>
          </div>
        </section>

        {/* Notifications */}
        <section className="notifications">
          <h2 className="section-title">🔔 Recent Notifications</h2>
          <ul className="notification-list">
            <li className="notification-item">📦 New delivery request from Westlands.</li>
            <li className="notification-item">💰 Payment of KES 5,000 processed successfully.</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default CourierIndex;
