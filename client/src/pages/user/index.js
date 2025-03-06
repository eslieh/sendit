import React, { useState, useEffect } from "react";
import Usernav from "../../components/Usernav";
import api from "../../services/api";
import TransitDeliveries from "../../components/TransitDeliveries";
import { useNavigate } from "react-router-dom";
const UserHome = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading_result, SetLoadingResults] = useState(true);
  const [quotes, setQuotes] = useState(null);
  const navigate = useNavigate()
  const handleModalToggle = () => {
    setModalOpen(!modalOpen);
  };
  
  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/auth');
    }
  }, []);

  // Geocode function to convert location to lat/lng using Nominatim API
  const geocodeLocation = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${address}&format=json`
    );
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: data[0].lat,
        lon: data[0].lon,
      };
    }
    throw new Error("Location not found");
  };

  // Submit package and fetch route using OSRM
  const handleSubmitPackage = async () => {
    try {
      setLoading(true);
      setError("");

      // Geocode pickup and delivery locations
      const pickupCoords = await geocodeLocation(pickupLocation);
      const deliveryCoords = await geocodeLocation(deliveryLocation);

      // Call OSRM API for route
      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${deliveryCoords.lon},${deliveryCoords.lat}?overview=false`
      );
      const routeData = await routeResponse.json();
      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error("Route could not be calculated");
      }

      // Calculate the distance in kilometers from the OSRM response
      const routeDistance = routeData.routes[0].legs[0].distance / 1000; // Distance in kilometers

      // Set the calculated distance
      setDistance(routeDistance);

      const newDelivery = {
        pickupLocation,
        deliveryLocation,
        packageDescription,
        status: "requested",
        distance: routeDistance,
      };
      const endpoint = "/orders/quote";
      // const loading_result = false;
      try {
        const response = await api.post(endpoint, newDelivery);
        console.log("posted");
        console.log(response);
        setQuotes(response.quotes);
        SetLoadingResults(false);
      } catch (error) {
        console.error(error.message);
        SetLoadingResults(true);
      }

      // console.log("New Delivery:", newDelivery); // Log the delivery data with distance

      handleModalToggle(); // Close the modal
    } catch (err) {
      setError("Failed to calculate route. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const requestsDelivery = async (id) => {
    const authorise = alert("Are you sure?")
    const endpoint = '/orders';
    const deliverly = {
      courier_id: id,
      description: packageDescription,
      pickup_location: pickupLocation,
      delivery_location: deliveryLocation, 
      distance: distance
    };
  
    try {
      const response = await api.post(endpoint, deliverly);
      
      const responseMessage = response?.message || "No response message";
      navigate('/user/deliveries')
      alert(responseMessage);
  
      if (responseMessage !== "Order created successfully") {
        alert(responseMessage);
      } else {
        console.log("Delivery request was successful");
        // You can add further logic here (e.g., redirect or update UI)
      }
    } catch (err) {
      console.error("Delivery request failed:", err);
      setError("Failed to request delivery");
    }
  };
  
  return (
    <div className="main_user_class">
      <Usernav />
      <div className="rest_body_contents">
        <div className="actionpuller">
          <button className="sendapkg" onClick={handleModalToggle}>
            Send a package <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="flex_wrappeed_contents">
          {/* Package Details Popup */}
          {modalOpen && (
            <div className="action_puller">
              <div className="package-modal">
                <div className="modal-content">
                  <h3>Enter Package Details</h3>
                  <label>Pickup Location:</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                  <label>Delivery Location:</label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                  <label>Package Description:</label>
                  <textarea
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                  />
                  <button onClick={handleSubmitPackage} disabled={loading}>
                    {loading ? "Processing..." : "Send Package"}
                  </button>
                  <button onClick={handleModalToggle}>Close</button>
                  {error && <p className="error">{error}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Show the distance once calculated */}
          {distance !== null && (
            <div className="local_results">
              <div className="distance-info">
                <h4>Package Distance</h4>
                <p>
                  The distance between your pickup and delivery locations is{" "}
                  {distance} kilometers.
                </p>
              </div>
              <div className="results_contents">
                {loading_result ? (
                  <div className="results_loading">loading_quote</div>
                ) : (
                  <div className="detaillll">
                    <div className="deliverly_results">
                    {quotes.map((courier) => (
                      <div className="delivery_quotes" onClick={() => requestsDelivery(courier.courier_id)}>
                        <div className="courier_icon_info">
                          <i className="fa-solid fa-truck"></i>
                        </div>
                        <div className="details_all">
                          <div className="courier">{courier.courier_name}</div>
                          <div className="courier-details">
                            <div className="price_per_km">
                              KES {courier.price_per_km} Per KM
                             </div>
                            <div className="total_price">
                              KES {courier.total_price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                   <iframe
                   className="flex-right-map"
                   frameBorder="0"
                   src={`https://www.google.com/maps/embed/v1/directions?origin=${pickupLocation}&destination=${deliveryLocation}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
                 ></iframe>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="current_deliveries">
          <TransitDeliveries/>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
