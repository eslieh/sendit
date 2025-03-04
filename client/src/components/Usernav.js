import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 

const navTabs = [
  {
    name: "Home",
    icon: <i className="fa-solid fa-house"></i>,
    link: "/user",
  },
  {
    name: "Deliveries",
    icon: <i className="fa-solid fa-truck"></i>,
    link: "/user/deliveries",
  },
  {
    name: "Account",
    icon: <i className="fa-solid fa-user"></i>,
    link: "/user/account",
  },
];

const Usernav = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get current route

  return (
    <div className="nav-main-container">
      <div className="image-held">
        <img
          src="/senditmain.png"
          className="main-image"
          onClick={() => navigate("/user")}
          alt="logo"
        />
      </div>
      <nav className="navigation_routes">
        <div className="nav-tabs">
          {navTabs.map((tab, index) => (
            <div
              key={index}
              className={`nav-tab ${location.pathname === tab.link ? "active" : ""}`} // Add active class when route matches
            >
              <Link to={tab.link} className="nav-link">
                {tab.icon} <span>{tab.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Usernav;
