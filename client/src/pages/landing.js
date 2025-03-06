import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Landing = () => {
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
      role: "user",
    },
  ];

  const imagesFrontend = {
    logo: "./senditmain.png",
    percels:
      "https://images.pexels.com/photos/7843956/pexels-photo-7843956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    services: {
      percel: {
        image:
          "https://i.pinimg.com/736x/e5/4f/0c/e54f0c109edb5b7ef8e214be45c1988d.jpg",
        details: ["Fast delivery", "Affordable rates", "Secure handling"],
      },
      tracking: {
        image:
          "https://i.pinimg.com/736x/ba/f1/c3/baf1c39ca4699f943a2121eadbb39714.jpg",
        details: ["Live tracking", "ETA updates", "24/7 Support"],
      },
      order: {
        image:
          "https://i.pinimg.com/736x/9b/0b/d4/9b0bd42192135f58a051ebb2b1c5e02f.jpg",
        details: [
          "Easy ordering",
          "Multiple payment options",
          "Scheduled deliveries",
        ],
      },
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
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
        <div className="right_flex_icon">
          <a href="/auth">
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
                if (item.role == "user") {
                  navigate("/auth");
                } else {
                  navigate("flex");
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

      <div className="half-flex-name">
        <div className="center_main_name">
          <p className="Senditp_par">Sendit</p>
          <div className="landingtext">
            <h3 className="span2">Send wherever.</h3>
            <h3 className="span3">Whenever.</h3>
          </div>
        </div>
      </div>
      <div className="emptysscre"></div>
      <div className="full_main_images">
        <img
          className="main_full_img"
          src={imagesFrontend.percels}
          alt="Parcels"
        />
      </div>

      <div className="our_service_main">
        <div className="main_containerdd">
          <div className="about-data">
            <h3 className="label_service">Our Services</h3>
            <p className="about-details">
              Products and features vary by country. Some features listed here
              may not be available in your app.
            </p>
          </div>
          <div className="flex_wrapp_images">
            {Object.entries(imagesFrontend.services).map(([key, value]) => (
              <div className="image_context_" key={key}>
                <div className="hover_details">
                  <div className="main-data-hover">
                    <h1 className="hover_head">
                      {key.replace(/^\w/, (c) => c.toUpperCase())}
                    </h1>
                    {/* Dynamic ride details */}
                    {value.details.map((detail, index) => (
                      <div className="ride_detail" key={index}>
                        {detail}
                      </div>
                    ))}
                    <a href="auth/">
                      <div className="get-starteds">Get Started</div>
                    </a>
                  </div>
                </div>
                <img className="image_holderd" src={value.image} alt={key} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="full_main_images">
        <img className="main_full_img" src={imagesFrontend.final} alt="Final" />
      </div>

      <div className="last_final_page">
        <div className="center-details_data">
          <span className="final_center_data">
            Delivering a Better Experience, Every Package
          </span>
        </div>
      </div>

      <div className="about_us">
        <div className="block_about_details">
          <span className="ght">About Us</span>
          <span className="final_center_data">
            Sendit is the first African logistics super app.
          </span>
          <span className="mission_data">
            We're making cities for people, offering better alternatives for
            every purpose a private car serves — including ride-hailing, shared
            cars, scooters, and food and grocery delivery.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
