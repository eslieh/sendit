import React, { useState, useEffect } from "react";
import Usernav from "../../components/Usernav";
import "./deliveries.css";
import api from "../../services/api"; // Ensure this is correctly configured
import { data } from "react-router-dom";
import { useNotify } from "../../services/NotifyContext";
const DeliveriesUser = () => {
  const notify = useNotify()
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders"); // Replace with your API endpoint
        setOrders(response.orders);
        console.log(response.orders)
      } catch (err) {
        console.error("Error fetching orders:", err);
        notify("there was problem loading deliveries",  true)
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateDropOff = async (id, newDropOff) => {
    try {
      const response = await api.patch(`/orders/${id}`, {
        delivery_location: newDropOff,
      });

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id
              ? { ...order, delivery_location: newDropOff, distance: response.data.new_distance, price: response.data.new_price }
              : order
          )
        );
        notify("Dropoff location updated successfull", false)
      }
    } catch (err) {
      console.error("Error updating drop-off location:", err);
      notify("Failed to update drop-off location.", true);
    }
  };

  // if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="main_user_class">
      <Usernav />
      <div className="rest_body_contents">
        <h2 className="page-title">My Delivery History</h2>
        <div className="deliveries-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Pickup</th>
                <th>Drop-off</th>
                <th>Distance (km)</th>
                <th>Price (Ksh)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.description}</td>
                  <td>{order.pickup_location}</td>
                  <td>
                    {order.status === "pending" ? (
                      <input
                        type="text"
                        defaultValue={order.delivery_location}
                        onBlur={(e) => updateDropOff(order.id, e.target.value)}
                      />
                    ) : (
                      order.delivery_location
                    )}
                  </td>
                  <td>{order.distance.toFixed(1)}</td>
                  <td>Ksh {order.price.toFixed(2)}</td>
                  <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                  <td>
                    {order.status === "Pending" && (
                      <button className="update-btn" onClick={() => updateDropOff(order.id, order.delivery_location)}>
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveriesUser;
