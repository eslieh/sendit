import React, { useState, useEffect } from "react";
import CauNav from "../../components/CauNav";
import api from "../../services/api"; // Axios instance

const Company = () => {
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [pricePerKm, setPricePerKm] = useState(0.0);
  const [newPrice, setNewPrice] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Fetch Wallet Balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get("/couriers/wallet");
        setWalletBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        alert("Failed to load wallet balance.");
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletBalance();
  }, []);

  // Fetch Price Per KM
  useEffect(() => {
    const fetchPricePerKm = async () => {
      try {
        const response = await api.get("/couriers/pricing");
        setPricePerKm(response.data.price_per_km);
      } catch (error) {
        console.error("Error fetching price per km:", error);
        alert("Failed to load price per km.");
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPricePerKm();
  }, []);

  // Update Price Per KM
  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      alert("Enter a valid price!");
      return;
    }

    try {
      const response = await api.put("/couries/pricing", {
        price_per_km: parseFloat(newPrice),
      });
      setPricePerKm(response.data.price_per_km);
      setNewPrice("");
      alert("Price per KM updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price. Try again.");
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    localStorage.removeItem("userToken");
    alert("Logging out...");
    window.location.href = "/auth";
  };

  return (
    <div className="main_user_class">
      <CauNav />
      <div className="rest_body_contents">
        {/* Wallet Section */}
        <div className="wallet-section">
          <h2>💰 Company Wallet</h2>
          {loadingWallet ? (
            <p>Loading wallet balance...</p>
          ) : (
            <p>Balance: <span>${walletBalance.toFixed(2)}</span></p>
          )}
        </div>

        {/* Pricing Update Section */}
        <div className="pricing-section">
          <h2>📌 Set Price Per KM</h2>
          {loadingPrice ? (
            <p>Loading price per km...</p>
          ) : (
            <>
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
            </>
          )}
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
