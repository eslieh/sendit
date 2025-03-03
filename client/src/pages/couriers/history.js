import React, { useState, useEffect } from "react";
import CauNav from "../../components/CauNav";
import api from "../../services/api";
const History = () => {
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/couriers/orders"); // Replace with your API URL
        const data = response.orders;
        setDeliveryHistory(data);
      } catch (error) {
        console.error("Error fetching delivery history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        <h2 className="section-title">📜 Delivery History</h2>

        {loading ? (
          <p>Loading history...</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Drop-off</th>
                <th>Distance</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryHistory.length > 0 ? (
                deliveryHistory.map((delivery) => (
                  <tr key={delivery.id} className={delivery.status === "cancelled" ? "canceled-row" : ""}>
                    <td>{delivery.customer}</td>
                    <td>{delivery.pickup_location}</td>
                    <td>{delivery.delivery_location}</td>
                    <td>{delivery.distance} km</td>
                    <td>KES {delivery.pricing}</td>
                    <td className={`status ${delivery.status.toLowerCase()}`}>{delivery.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No delivery history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
