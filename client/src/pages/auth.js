import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api"; // Import the Axios service

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromURL = queryParams.get("ref") || "user"; // Default role: user
  const navigate = useNavigate();
  const [role, setRole] = useState(roleFromURL);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // Track submission state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setRole(roleFromURL);
  }, [roleFromURL]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ first_name: "", last_name: "", email: "", password: "" });
  };

  const setToken = (token) => {
    sessionStorage.setItem("access_token", token);
    document.cookie = `access_token=${token}; path=/; secure; HttpOnly`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submits

    setLoading(true); // Start loading state

    const endpoint = isLogin
      ? "/login"
      : role === "user"
      ? "/signup_user"
      : "/signup_courier";

    try {
      const response = await api.post(endpoint, formData); // Use Axios API service

      if (isLogin) {
        setToken(response.access_token);
        alert(response.message);
        navigate(role === "user" ? "/user" : "/courier");
      } else {
        alert("Signup successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="auth-container">
      <div className="center_contents">
        <div className="icon_details_where">
          <img
            src="./senditmain.png"
            className="auth_image_conts"
            onClick={() => navigate("/")}
            alt="logo"
          />
        </div>
        <div className="authenticator_form">
          <h2>
            {isLogin ? "Login" : "Signup"} as{" "}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              style={{
                backgroundColor: loading ? "#009829a6" : "##00b560",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
            </button>
          </form>

          <p onClick={toggleAuthMode} className="toggle-auth">
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
