import React, { useState, useEffect } from "react";
import CauNav from "../../components/CauNav";
import api from "../../services/api"; // Axios instance
import { useNotify } from "../../services/NotifyContext";
const Company = () => {
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [pricePerKm, setPricePerKm] = useState(0.0);
  const [newPrice, setNewPrice] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const notify = useNotify()
  // Fetch Wallet Balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get("/wallet/courier/balance");
        setWalletBalance(response.balance);
        notify("fetched", false)
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        notify("Failed to load wallet balance.", true);
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
        setPricePerKm(response.price_per_km);
      } catch (error) {
        console.error("Error fetching price per km:", error);
        notify("Failed to load price per km.", true);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPricePerKm();
  }, []);

  // Update Price Per KM
  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      // notify("Enter a valid price!", false);
      // return;
    }

    try {
      const formData = {
        price_per_km: parseFloat(newPrice),
      }
      const response = await api.post("/couriers/pricing", formData);
      setPricePerKm(response.price_per_km);
      setNewPrice("");
      notify("Price per KM updated successfully!", false);
    } catch (error) {
      console.error("Error updating price:", error);
      notify("Failed to update price. Try again.", true);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    localStorage.removeItem("userToken");
    notify("Logging out...", true);
    window.location.href = "/auth?ref=courier";
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
            <p>Balance: <span>KES {walletBalance.toFixed(2)}</span></p>
          )}
        </div>

        {/* Pricing Update Section */}
        <div className="pricing-section">
          <h2>📌 Set Price Per KM</h2>
          {loadingPrice ? (
            <p>Loading price per km...</p>
          ) : (
            <>
              <p>Current Rate: <strong>KES {pricePerKm.toFixed(2)}</strong> per km</p>
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
