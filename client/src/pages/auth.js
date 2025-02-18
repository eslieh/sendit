import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromURL = queryParams.get("ref") || "user"; // Default to "user"
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(roleFromURL);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setRole(roleFromURL); // Update role if URL changes
  }, [roleFromURL]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ first_name: "", last_name: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      `Submitting ${isLogin ? "Login" : "Signup"} for ${role}`,
      formData
    );
    // Send request to backend
  };

  return (
    <div className="auth-container">
      <div className="center_contents">
        <div className="icon_details_where">
            <img src="./senditmain.png" className="auth_image_conts" onClick={() => navigate('/')} alt="logo"/>
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
            <button type="submit">{isLogin ? "Login" : "Signup"}</button>
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
