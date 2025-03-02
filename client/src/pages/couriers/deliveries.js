import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CauNav from "../../components/CauNav";
import api from "../../services/api";
import { useNotify } from "../../services/NotifyContext";

const Deliveries = () => {
  const { id } = useParams();
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [inTransit, setInTransit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);
  const notify = useNotify();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(`/couriers/orders`);
        const orders = response.orders;
        const pendingOrders = orders.filter(order => order.status === "pending");
        const transitOrders = orders.filter(order => order.status === "in_progress");

        setDeliveryRequests(pendingOrders);
        setInTransit(transitOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setProcessing(orderId);
    try {
      const response = await api.patch(`couriers/orders/${orderId}/status`, { status });
      if (response) {
        setDeliveryRequests(prev => prev.filter(order => order.id !== orderId));
        if (status === "in_progress") {
          const acceptedOrder = deliveryRequests.find(order => order.id === orderId);
          if (acceptedOrder) setInTransit(prev => [...prev, { ...acceptedOrder, status: "in_progress" }]);
        }
        notify("✅ Status update was successful!", false);
      } else {
        notify(`⚠ Error: ${response.data?.message || "Failed to update status"}`, true);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notify(`❌ Error updating the status: ${error.message}`, true);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <section className="delivery-section">
              <h2 className="section-title">📦 Delivery Requests</h2>
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Pickup</th>
                    <th>Drop-off</th>
                    <th>Distance</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRequests.length > 0 ? (
                    deliveryRequests.map(order => (
                      <tr key={order.id}>
                        <td>{order.customer}</td>
                        <td>{order.pickup_location}</td>
                        <td>{order.delivery_location}</td>
                        <td>{order.distance} km</td>
                        <td>KES {order.pricing}</td>
                        <td>
                          <button 
                            className="accept-btn"
                            disabled={processing === order.id}
                            onClick={() => updateStatus(order.id, "in_progress")}
                          >
                            {processing === order.id ? "Processing..." : "✔ Accept"}
                          </button>
                          <button 
                            className="reject-btn"
                            disabled={processing === order.id}
                            onClick={() => updateStatus(order.id, "cancelled")}
                          >
                            {processing === order.id ? "Processing..." : "❌ Reject"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No new delivery requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="delivery-section">
              <h2 className="section-title">🚚 In Transit</h2>
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Pickup</th>
                    <th>Drop-off</th>
                    <th>Distance</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inTransit.length > 0 ? (
                    inTransit.map(order => (
                      <tr key={order.id}>
                        <td>{order.customer}</td>
                        <td>{order.pickup_location}</td>
                        <td>{order.delivery_location}</td>
                        <td>{order.distance} km</td>
                        <td>KES {order.pricing}</td>
                        <td>
                          <button 
                            className="delivered-btn"
                            disabled={processing === order.id}
                            onClick={() => updateStatus(order.id, "delivered")}
                          >
                            {processing === order.id ? "Processing..." : "✅ Mark as Delivered"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No active deliveries.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
