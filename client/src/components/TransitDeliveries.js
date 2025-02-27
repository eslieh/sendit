import { useState } from "react";

const TransitDeliveries = () => {
    const [orders, setOrders] = useState([
        {
          id: 1,
          description: "Laptop Delivery",
          pickup_location: "Westlands, Nairobi",
          delivery_location: "Karen, Nairobi",
          status: "In Transit",
          price: 1200.0,
          distance: 15.0,
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
          description: "Phone Accessories",
          pickup_location: "Parklands, Nairobi",
          delivery_location: "Ngong Road, Nairobi",
          status: "In Transit",
          price: 450.0,
          distance: 10.2,
          courier_id: 103,
        },
        {
          id: 4,
          description: "Furniture Delivery",
          pickup_location: "Industrial Area, Nairobi",
          delivery_location: "Ruiru, Nairobi",
          status: "In Transit",
          price: 2500.0,
          distance: 22.5,
          courier_id: 104,
        },
        {
          id: 5,
          description: "Cosmetics Order",
          pickup_location: "Lavington, Nairobi",
          delivery_location: "Embakasi, Nairobi",
          status: "In Transit",
          price: 550.0,
          distance: 13.7,
          courier_id: 105,
        },
        {
          id: 6,
          description: "Grocery Delivery",
          pickup_location: "Kilimani, Nairobi",
          delivery_location: "Lang'ata, Nairobi",
          status: "In Transit",
          price: 200.0,
          distance: 5.8,
          courier_id: 106,
        },
        {
          id: 7,
          description: "Medicine Delivery",
          pickup_location: "Upper Hill, Nairobi",
          delivery_location: "Thika Road, Nairobi",
          status: "In Transit",
          price: 800.0,
          distance: 18.0,
          courier_id: 107,
        },
        {
          id: 8,
          description: "Home Appliance",
          pickup_location: "South B, Nairobi",
          delivery_location: "Ngara, Nairobi",
          status: "In Transit",
          price: 1500.0,
          distance: 12.4,
          courier_id: 108,
        },
        {
          id: 9,
          description: "Gym Equipment",
          pickup_location: "Eastleigh, Nairobi",
          delivery_location: "Westlands, Nairobi",
          status: "In Transit",
          price: 3500.0,
          distance: 20.0,
          courier_id: 109,
        },
        {
          id: 10,
          description: "Car Spare Parts",
          pickup_location: "Gikomba, Nairobi",
          delivery_location: "Kitengela, Nairobi",
          status: "In Transit",
          price: 4200.0,
          distance: 30.5,
          courier_id: 110,
        },
        {
          id: 11,
          description: "Books Order",
          pickup_location: "Town Center, Nairobi",
          delivery_location: "Juja, Nairobi",
          status: "In Transit",
          price: 600.0,
          distance: 19.0,
          courier_id: 111,
        },
        {
          id: 12,
          description: "Kitchen Supplies",
          pickup_location: "Madaraka, Nairobi",
          delivery_location: "Donholm, Nairobi",
          status: "In Transit",
          price: 720.0,
          distance: 9.8,
          courier_id: 112,
        },
        {
          id: 13,
          description: "Office Supplies",
          pickup_location: "Ngong, Nairobi",
          delivery_location: "Kikuyu, Nairobi",
          status: "In Transit",
          price: 950.0,
          distance: 16.4,
          courier_id: 113,
        },
        {
          id: 14,
          description: "Electronic Gadgets",
          pickup_location: "CBD, Nairobi",
          delivery_location: "Mombasa Road, Nairobi",
          status: "In Transit",
          price: 1800.0,
          distance: 14.2,
          courier_id: 114,
        },
        {
          id: 15,
          description: "Bicycle Delivery",
          pickup_location: "Dagoretti, Nairobi",
          delivery_location: "Kawangware, Nairobi",
          status: "In Transit",
          price: 2500.0,
          distance: 7.5,
          courier_id: 115,
        },
    ]);
    
    
  const [mainOrder, setMainOrder] = useState(orders[0]);

  const handleOrderClick = (order) => {
    setMainOrder(order);
    setOrders([order, ...orders.filter((o) => o.id !== order.id)]);
  };

  return (
    <div className="main_class">
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
              <i class="fa-solid fa-location-dot"></i>
              </div>
              <div className="location_ns">{mainOrder.delivery_location}</div>
            </div>
          </div>
          <div className="price_dists">{mainOrder.distance}KM · KES {mainOrder.price}</div>
        </div>
      </div>
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
                <i class="fa-solid fa-location-dot"></i>
                </div>
                <div className="location_ns">{order.delivery_location}</div>
              </div>
            </div>
            <div className="price_dists">{order.distance}KM · KES {order.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransitDeliveries;
