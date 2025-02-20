import React, { useState } from "react";
import Usernav from "../../components/Usernav";

const UserHome = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleModalToggle = () => {
    setModalOpen(!modalOpen);
  };

  // Geocode function to convert location to lat/lng using Nominatim API
  const geocodeLocation = async (address) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=json`);
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
        `http://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${deliveryCoords.lon},${deliveryCoords.lat}?overview=false`
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
        status: "In Transit",
        distance: routeDistance,
      };

      console.log("New Delivery:", newDelivery); // Log the delivery data with distance

      handleModalToggle(); // Close the modal
    } catch (err) {
      setError("Failed to calculate route. Please try again.");
    } finally {
      setLoading(false);
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

        {/* Package Details Popup */}
        {modalOpen && (
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
        )}

        {/* Show the distance once calculated */}
        {distance !== null && (
          <div className="distance-info">
            <h4>Package Distance</h4>
            <p>
              The distance between your pickup and delivery locations is{" "}
              {distance} kilometers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
