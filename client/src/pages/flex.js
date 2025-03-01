import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Flex = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [showNavbar, setShowNavbar] = useState(true);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setShowNavbar(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);
  const menuItems = [
    {
      icon: <i className="fa-solid fa-truck-fast"></i>,
      title: "Become a courier",
      description: "Deliver packages and get paid",
      role: "courier",
    },
    {
      icon: <i className="fa-solid fa-user"></i>, // Changed icon to user
      title: "Join as a User", // Updated title
      description: "Order parcels and track deliveries easily", // Updated description
      role: "user"
    },
  ];

  const imagesFrontend = {
    logo: "./senditmain.png",
    percels:
      "https://images.pexels.com/photos/7843956/pexels-photo-7843956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    services: {
      percel:
        "https://i.pinimg.com/736x/e5/4f/0c/e54f0c109edb5b7ef8e214be45c1988d.jpg",
      tracking:
        "https://i.pinimg.com/736x/ba/f1/c3/baf1c39ca4699f943a2121eadbb39714.jpg",
      order:
        "https://i.pinimg.com/736x/9b/0b/d4/9b0bd42192135f58a051ebb2b1c5e02f.jpg",
    },
    final:
      "https://i.pinimg.com/736x/ca/77/26/ca7726b4d6696adee7c1991e11701363.jpg",
  };

  return (
    <div className="sendit_landing">
      <div className={`sendit_home_top ${showNavbar ? "show" : "hide"}`}>
        <div className="sendit_flex_icon">
          <img
            className="main_icon"
            src={imagesFrontend.logo}
            alt="Sendit Logo"
            onClick={() => {navigate('/')}}
          />
        </div>
        <div className="right_flex_icon">
          <a href="auth/">
            <div className="login_btn">Register</div>
          </a>
          <button className="humberger" onClick={toggleMenu}>
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* Hamburger Menu (conditionally rendered) */}
      {menuOpen && (
        <div className="hamburger_menu">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={() => {
                if(item.role == "user"){
                  navigate('/auth')
                }else{
                  navigate('/flex')
                }
              }}
            >
              {item.icon}
              <div className="menu-text">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <video className="background_image" autoPlay loop muted width="100%">
          <source src="/assets/vid.mp4" type="video/mp4" />
      </video>
      <div className="all_detial-chso">
        <div className="conternt_hoder">
          <h2 className="make_sjj">
          Make money delivering Packages.
          </h2>
          <div onClick={() => (navigate('/auth?ref=courier'))} className="curiier_signup">Signup as a Courier</div>
        </div>
      </div>
    </div>
  );
};

export default Flex;
