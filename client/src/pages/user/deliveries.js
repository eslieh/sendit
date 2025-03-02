import React, { useState, useEffect } from "react";
import Usernav from "../../components/Usernav";
import "./deliveries.css";
import api from "../../services/api";
import { useNotify } from "../../services/NotifyContext";

const DeliveriesUser = () => {
  const notify = useNotify();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pricePerKm = 50; // Adjust price per km as needed

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        notify("There was a problem loading deliveries", true);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getCoordinates = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) throw new Error("Location not found");
    return { lat: data[0].lat, lon: data[0].lon };
  };

  const getDistance = async (pickup, dropoff) => {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.routes) throw new Error("Distance calculation failed");
    return data.routes[0].distance / 1000; // Convert meters to km
  };

  const updateDropOff = async (id, newDropOff, oldDistance, oldPrice) => {
    try {
      const order = orders.find((order) => order.id === id);
      const pickupCoords = await getCoordinates(order.pickup_location);
      const dropoffCoords = await getCoordinates(newDropOff);
      const newDistance = await getDistance(pickupCoords, dropoffCoords);
      const pricePerKm = oldPrice / oldDistance;
      const distanceDiff = newDistance - oldDistance;
      const priceDiff = distanceDiff * pricePerKm;
      const newPrice = oldPrice + priceDiff;

      const response = await api.patch(`/orders/${id}`, {
        delivery_location: newDropOff,
        new_distance: newDistance,
        new_price: newPrice,
      });

      if (response) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id
              ? { ...order, delivery_location: newDropOff, distance: newDistance, price: newPrice }
              : order
          )
        );
        notify("Dropoff location updated successfully", false);
      }
    } catch (err) {
      console.error("Error updating drop-off location:", err);
      notify("Failed to update drop-off location.", true);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      const response = await api.delete(`/orders/${id}`);

      if (response) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
        notify("Order cancelled successfully", false);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      notify("Failed to cancel order.", true);
    }
  };

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
                <th>Actions</th>
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
                        onBlur={(e) => updateDropOff(order.id, e.target.value, order.distance, order.price)}
                      />
                    ) : (
                      order.delivery_location
                    )}
                  </td>
                  <td>{order.distance.toFixed(1)}</td>
                  <td>Ksh {order.price.toFixed(2)}</td>
                  <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                  <td>
                    {order.status === "pending" && (
                      <>
                        <button
                          className="update-btn"
                          onClick={() => updateDropOff(order.id, order.delivery_location, order.distance, order.price)}
                        >
                          Update
                        </button>
                        <button className="cancel-btn" onClick={() => cancelOrder(order.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === "in_progress" && (
                      <button className="cancel-btn" onClick={() => cancelOrder(order.id)}>
                        Cancel
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
