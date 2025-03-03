import { useState, useEffect } from "react";
import api from "../services/api";

const TransitDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [mainOrder, setMainOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders"); // Replace with your actual API endpoint
        console.log(response);
        const data = response.orders.filter(order => order.status === "in_progress" || order.status === "pending");
        setOrders(data);
        if (data.length > 0) {
          setMainOrder(data[0]); // Set the first order as main order
        }
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setMainOrder(order);
    setOrders([order, ...orders.filter((o) => o.id !== order.id)]);
  };

  return (
    <div className="main_class">
      {mainOrder && (
        <div className="main_transit_views">
          <iframe
            className="maps_full mail"
            frameBorder="0"
            src={`https://www.google.com/maps/embed/v1/directions?origin=${mainOrder.pickup_location}&destination=${mainOrder.delivery_location}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
          ></iframe>
          <div className="transit_view" id="metadata">
            <div className="delivery_description">{mainOrder.description}</div>
            <div className="deliverly_meta_data">
              <div className="locationr">
                <div className="icon_hsold">
                  <i className="fa-solid fa-circle"></i>
                </div>
                <div className="location_ns">{mainOrder.pickup_location}</div>
              </div>
              <div className="line_holderd">
                <div className="line_placed"></div>
                <div className="status">{mainOrder.status}</div>
              </div>
              <div className="locationr">
                <div className="icon_hsold">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="location_ns">{mainOrder.delivery_location}</div>
              </div>
            </div>
            <div className="price_dists">
              {mainOrder.distance}KM · KES {mainOrder.price}
            </div>
          </div>
        </div>
      )}
      <div className="dejkr">Deliveries</div>
      <div className="other_transit_views">
        {orders.slice(1).map((order) => (
          <div key={order.id} className="transit_view" onClick={() => handleOrderClick(order)}>
            <div className="delivery_description">{order.description}</div>
            <div className="deliverly_meta_data">
              <div className="locationr">
                <div className="icon_hsold">
                  <i className="fa-solid fa-circle"></i>
                </div>
                <div className="location_ns">{order.pickup_location}</div>
              </div>
              <div className="line_holderd">
                <div className="line_placed"></div>
                <div className="status">{order.status}</div>
              </div>
              <div className="locationr">
                <div className="icon_hsold">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="location_ns">{order.delivery_location}</div>
              </div>
            </div>
            <div className="price_dists">
              {order.distance}KM · KES {order.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransitDeliveries;