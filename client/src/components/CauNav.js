import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const navTabs = [
  {
    name: "Home",
    icon: <i className="fa-solid fa-house"></i>, // Home icon
    link: "/courier",
  },
  {
    name: "Deliveries",
    icon: <i className="fa-solid fa-box"></i>, // Deliveries icon
    link: "/courier/deliveries",
  },
  {
    name: "History",
    icon: <i className="fa-solid fa-clock-rotate-left"></i>, // History icon
    link: "/courier/history",
  },
  {
    name: "Company",
    icon: <i className="fa-solid fa-building"></i>, // Company icon
    link: "/courier/company",
  },
];

const CauNav = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  return (
    <div className="nav-main-container">
      <div className="image-held">
        <img
          src="/senditmain.png"
          className="main-image"
          onClick={() => navigate("/courier")}
          alt="logo"
        />
      </div>
      <nav className="navigation_routes">
        <div className="nav-tabs">
          {navTabs.map((tab, index) => (
            <div
              key={index}
              className={`nav-tab ${location.pathname === tab.link ? "active" : ""}`} // Add active class
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

export default CauNav;
