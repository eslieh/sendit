import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Usernav from "../../components/Usernav";
import "./account.css";
import api from "../../services/api";
import { useNotify } from "../../services/NotifyContext";

const AccountUser = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/get_user_name");
        setUser(response);
      } catch (err) {
        setError("Failed to fetch user data.");
        notify("Failed to fetch user data.", false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get("/wallet/user/balance");
        setBalance(response.balance);
      } catch (error) {
        notify("Error fetching balance.", false);
      }
    };

    fetchBalance();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    localStorage.removeItem("userToken");
    notify("Logged out successfully.", true);
    navigate("/auth");
  };

  const validatePayment = () => {
    if (paymentMethod === "card") {
      return /^[0-9]{16}$/.test(paymentDetails);
    } else if (paymentMethod === "pesapal") {
      return /^[0-9]{10}$/.test(paymentDetails);
    }
    return false;
  };

  const handleTopup = async () => {
    if (!topupAmount || isNaN(topupAmount) || parseFloat(topupAmount) <= 0) {
      notify("Enter a valid top-up amount.", true);
      return;
    }

    if (!validatePayment()) {
      notify("Invalid payment details. Please check your credentials.", true);
      return;
    }

    try {
      const response = await api.post("/wallet/user/deposit", {
        amount: parseFloat(topupAmount),
      });

      if (response.new_balance !== undefined) {
        setBalance(response.new_balance);
        setTopupAmount("");
        setPaymentDetails("");
        notify(`Successfully topped up Ksh ${topupAmount}!`, false);
      }
    } catch (error) {
      notify("Something went wrong while topping up.", true);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="main_user_class">
      <Usernav />
      <div className="rest_body_contents">
        <h2 className="page-title">Account Settings</h2>

        {user && (
          <div className="user-info">
            <div className="avatar">
              {user.first_name?.[0] || "U"}
              {user.last_name?.[0] || ""}
            </div>
            <div className="user-details">
              <h3 className="user-name">
                {user.first_name} {user.last_name}
              </h3>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
        )}

        <div className="wallet-sections">
          <div className="walletdet">
            <h3 className="wallet-title">Wallet Balance</h3>
            <p className="wallet-balance">Ksh {balance.toFixed(2)}</p>
          </div>
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
