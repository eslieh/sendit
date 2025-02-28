import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Usernav from "../../components/Usernav";
import "./account.css";
import api from "../../services/api";

const AccountUser = () => {
  const navigate = useNavigate();

  // Mock user data (Replace with actual API/user context)
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    walletBalance: 0.0, // Mock balance
  };

  const [balance, setBalance] = useState(user.walletBalance);
  const [topupAmount, setTopupAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [paymentDetails, setPaymentDetails] = useState("");

  // Fetch balance only once when the component mounts
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get("/wallet/user/balance");
        setBalance(response.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    localStorage.removeItem("userToken");
    navigate("/auth");
  };

  const validatePayment = () => {
    if (paymentMethod === "card") {
      // Simple card validation (16 digits)
      return /^[0-9]{16}$/.test(paymentDetails);
    } else if (paymentMethod === "pesapal") {
      // Simple Pesapal validation (mock format)
      return /^[0-9]{10}$/.test(paymentDetails);
    }
    return false;
  };

  const handleTopup = async () => {
    if (!topupAmount || isNaN(topupAmount) || parseFloat(topupAmount) <= 0) {
      alert("Enter a valid top-up amount.");
      return;
    }

    if (!validatePayment()) {
      alert("Invalid payment details. Please check your credentials.");
      return;
    }

    try {
      const response = await api.post("/wallet/user/deposit", {
        amount: parseFloat(topupAmount),
      });

      if (response.new_balance) {
        setBalance(response.new_balance);
        setTopupAmount("");
        setPaymentDetails("");
        alert(`Successfully topped up Ksh ${topupAmount}!`);
      }
    } catch (error) {
      console.error("Error topping up:", error);
      alert("Something went wrong: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="main_user_class">
      <Usernav />
      <div className="rest_body_contents">
        <h2 className="page-title">Account Settings</h2>

        {/* User Info Section */}
        <div className="user-info">
          <div className="avatar">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="user-details">
            <h3 className="user-name">
              {user.firstName} {user.lastName}
            </h3>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="wallet-sections">
          <div className="walletdet">
            <h3 className="wallet-title">Wallet Balance</h3>
            <p className="wallet-balance">Ksh {balance.toFixed(2)}</p>
          </div>
          {/* Top-up Form */}
          <div className="topup-form">
            <input
              type="number"
              placeholder="Enter amount (Ksh)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
            />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="pesapal">Pesapal</option>
              <option value="card">Card</option>
            </select>

            <input
              type="text"
              placeholder={
                paymentMethod === "card"
                  ? "Enter Card Number (16 digits)"
                  : "Enter Pesapal ID (10 digits)"
              }
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
            />

            <button className="topup-btn" onClick={handleTopup}>
              Top Up
            </button>
          </div>
        </div>

        {/* Logout & Links */}
        <div className="account-section">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <div className="links">
            <a href="/about" className="account-link">
              About the App
            </a>
            <a href="/terms" className="account-link">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountUser;
