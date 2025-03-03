import React, { useState, useEffect } from "react";
import CauNav from "../../components/CauNav";
import "./couriers.css";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
const CourierIndex = () => {
  const [stats, setStats] = useState({
    active_deliveries: 0,
    completed_deliveries: 0,
    ongoing_deliveries: 0,
    total_distance_covered: 0.0,
    total_earnings: 0.0,
  });
  const navigate = useNavigate()
  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/auth?ref=courier');
    }
  }, []);
  useEffect(() => {
    const fetchCourierStats = async () => {
      try {
        const response = await api.get("/courier/stat"); // Replace with actual API endpoint
        // if (!response.ok) throw new Error("Failed to fetch stats");
        // console.log(response)
        const data = response;
        setStats(data);
      } catch (error) {
        console.error("Error fetching courier stats:", error);
      }
    };

    fetchCourierStats();
  }, []);

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
            <p className="stat-value">KES {stats.total_earnings.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Deliveries Completed</h3>
            <p className="stat-value">{stats.completed_deliveries}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Ongoing Deliveries</h3>
            <p className="stat-value">{stats.ongoing_deliveries}</p>
          </div>
        </section>

        {/* Quick Actions */}
        {/* <section className="quick-actions">
          <button className="action-btn">📦 Start a New Delivery</button>
          <button className="action-btn">💰 Withdraw Earnings</button>
          <button className="action-btn">📜 View Delivery History</button>
        </section> */}

        {/* Delivery Performance Stats */}
        <section className="delivery-performance">
          <h2 className="section-title">📊 Delivery Statistics</h2>
          <div className="performance-grid">
            <p><strong>🛣️ Total Distance Covered:</strong> {stats.total_distance_covered} km</p>
            <p><strong>📦 Active Deliveries:</strong> {stats.active_deliveries}</p>
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
