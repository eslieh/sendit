import React, { useState } from "react";
import CauNav from "../../components/CauNav";

const History = () => {
  // Mock Data - Replace with API data
  const [deliveryHistory, setDeliveryHistory] = useState([
    { id: 1, customer: "John Doe", pickup: "Westlands", dropoff: "Kilimani", distance: "5.4 km", price: "$3.50", status: "Delivered" },
    { id: 2, customer: "Jane Smith", pickup: "CBD", dropoff: "Lavington", distance: "7.2 km", price: "$5.00", status: "Delivered" },
    { id: 3, customer: "Mike Ross", pickup: "Ngong Road", dropoff: "Kasarani", distance: "15 km", price: "$8.00", status: "Canceled" },
    { id: 4, customer: "Rachel Green", pickup: "Parklands", dropoff: "Ruiru", distance: "20 km", price: "$10.50", status: "Delivered" },
  ]);

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        <h2 className="section-title">📜 Delivery History</h2>

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
                <tr key={delivery.id} className={delivery.status === "Canceled" ? "canceled-row" : ""}>
                  <td>{delivery.customer}</td>
                  <td>{delivery.pickup}</td>
                  <td>{delivery.dropoff}</td>
                  <td>{delivery.distance}</td>
                  <td>{delivery.price}</td>
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
      </div>
    </div>
  );
};

export default History;
