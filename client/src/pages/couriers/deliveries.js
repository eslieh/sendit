import React, { useState } from "react";
import CauNav from "../../components/CauNav";

const Deliveries = () => {
  // Mock Data - Replace with API data
  const [deliveryRequests, setDeliveryRequests] = useState([
    { id: 1, customer: "John Doe", pickup: "Westlands", dropoff: "Kilimani", distance: "5.4 km", price: "$3.50", status: "pending" },
    { id: 2, customer: "Jane Smith", pickup: "CBD", dropoff: "Lavington", distance: "7.2 km", price: "$5.00", status: "pending" },
  ]);

  const [inTransit, setInTransit] = useState([
    { id: 3, customer: "Mike Ross", pickup: "Ngong Road", dropoff: "Kasarani", distance: "15 km", price: "$8.00", status: "in-transit" },
    { id: 4, customer: "Rachel Green", pickup: "Parklands", dropoff: "Ruiru", distance: "20 km", price: "$10.50", status: "in-transit" },
  ]);

  // Accept Delivery Request
  const acceptRequest = (id) => {
    const accepted = deliveryRequests.find((delivery) => delivery.id === id);
    setDeliveryRequests(deliveryRequests.filter((delivery) => delivery.id !== id));
    setInTransit([...inTransit, { ...accepted, status: "in-transit" }]);
  };

  // Reject Delivery Request
  const rejectRequest = (id) => {
    setDeliveryRequests(deliveryRequests.filter((delivery) => delivery.id !== id));
  };

  // Mark Delivery as Completed
  const markAsDelivered = (id) => {
    setInTransit(inTransit.filter((delivery) => delivery.id !== id));
  };

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        
        {/* Delivery Requests Table */}
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
                deliveryRequests.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.customer}</td>
                    <td>{delivery.pickup}</td>
                    <td>{delivery.dropoff}</td>
                    <td>{delivery.distance}</td>
                    <td>{delivery.price}</td>
                    <td>
                      <button className="accept-btn" onClick={() => acceptRequest(delivery.id)}>✔ Accept</button>
                      <button className="reject-btn" onClick={() => rejectRequest(delivery.id)}>❌ Reject</button>
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

        {/* In Transit Table */}
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
                inTransit.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.customer}</td>
                    <td>{delivery.pickup}</td>
                    <td>{delivery.dropoff}</td>
                    <td>{delivery.distance}</td>
                    <td>{delivery.price}</td>
                    <td>
                      <button className="delivered-btn" onClick={() => markAsDelivered(delivery.id)}>✅ Mark as Delivered</button>
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

      </div>
    </div>
  );
};

export default Deliveries;
