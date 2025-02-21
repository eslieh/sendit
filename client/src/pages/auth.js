import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromURL = queryParams.get("ref") || "user"; // Default role: user
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(roleFromURL);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setToken = (token) => {
    sessionStorage.setItem("access_token", token);
    document.cookie = `access_token=${token}; path=/; secure; HttpOnly`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submits

    setLoading(true); // Start loading state

    const url = isLogin
      ? "https://sendit-5-2epe.onrender.com/login"
      : role === "user"
      ? "https://sendit-5-2epe.onrender.com/signup_user"
      : "https://sendit-5-2epe.onrender.com/signup_courier";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setToken(data.access_token);
          alert(data.message);
          navigate(role === "user" ? "/user" : "/courier");
        } else {
          alert("Signup successful! Please log in.");
          setIsLogin(true);
        }
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Try again later.");
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
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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
