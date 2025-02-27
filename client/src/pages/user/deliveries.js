import React, { useState } from "react";
import Usernav from "../../components/Usernav";
import "./deliveries.css";

const DeliveriesUser = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      description: "Electronics Package",
      pickup_location: "Downtown, Nairobi",
      delivery_location: "Westlands, Nairobi",
      status: "Delivered",
      price: 500.0,
      distance: 12.5,
      courier_id: 101,
    },
    {
      id: 2,
      description: "Clothing Order",
      pickup_location: "CBD, Nairobi",
      delivery_location: "Kasarani, Nairobi",
      status: "In Transit",
      price: 300.0,
      distance: 8.0,
      courier_id: 102,
    },
    {
      id: 3,
      description: "Food Delivery",
      pickup_location: "Karen, Nairobi",
      delivery_location: "Ngong Road, Nairobi",
      status: "Pending",
      price: 250.0,
      distance: 5.5,
      courier_id: 103,
    },
  ]);

  const updateDropOff = async (id, newDropOff) => {
    // Mock function to calculate new distance (Replace with OpenStreetMap API call)
    const calculateDistance = async (pickup, dropoff) => {
      console.log(`Calculating distance from ${pickup} to ${dropoff}...`);
      return Math.random() * 10 + 5; // Mock distance (5-15 km)
    };

    const updatedOrders = orders.map(async (order) => {
      if (order.id === id && order.status === "Pending") {
        const newDistance = await calculateDistance(order.pickup_location, newDropOff);
        const newPrice = newDistance * 50; // Example: 50 Ksh per km

        return { ...order, delivery_location: newDropOff, distance: newDistance, price: newPrice };
      }
      return order;
    });

    Promise.all(updatedOrders).then((updatedData) => setOrders(updatedData));
  };

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
                    {order.status === "Pending" ? (
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
                  <td className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </td>
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
