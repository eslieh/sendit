import React, { useState } from "react";
import CauNav from "../../components/CauNav";

const Company = () => {
  // Mock Data - Replace with API Data
  const [walletBalance, setWalletBalance] = useState(500.0); // Example balance
  const [pricePerKm, setPricePerKm] = useState(1.5); // Example price per km
  const [newPrice, setNewPrice] = useState("");

  // Handle Price Update
  const handleUpdatePrice = () => {
    if (newPrice && !isNaN(newPrice) && newPrice > 0) {
      setPricePerKm(parseFloat(newPrice));
      setNewPrice("");
      alert("Price per KM updated successfully!");
    } else {
      alert("Enter a valid price!");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    alert("Logging out..."); // Replace with actual logout logic
  };

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        {/* Wallet Section */}
        <div className="wallet-section">
          <h2>💰 Company Wallet</h2>
          <p>Balance: <span>${walletBalance.toFixed(2)}</span></p>
        </div>

        {/* Pricing Update Section */}
        <div className="pricing-section">
          <h2>📌 Set Price Per KM</h2>
          <p>Current Rate: <strong>${pricePerKm.toFixed(2)}</strong> per km</p>
          <div className="input-group">
            <input
              type="number"
              placeholder="Enter new price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <button onClick={handleUpdatePrice}>Update Price</button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Company;
