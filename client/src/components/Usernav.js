import React from "react";
import { Link, useNavigate } from "react-router-dom";  // Import useNavigate here

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
  const navigate = useNavigate();  // Declare useNavigate inside the component

  return (
    <div className="nav-main-container">
      <div className="fnamee-d">Eslieh</div>
      <div className="image-held">
        <img
          src="/senditmain.png"
          className="main-image"
          onClick={() => navigate("/user")}  // Navigate to home on click
          alt="logo"
        />
      </div>
      <nav className="navigation_routes">
        <div className="nav-tabs">
          {navTabs.map((tab, index) => (
            <div key={index} className="nav-tab">
              <Link
                to={tab.link}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}  // Conditionally add active class
              >
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
