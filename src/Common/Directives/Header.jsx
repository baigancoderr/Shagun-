import "../Styles/Navbar.css";
import logo from "../assets/logo.png";
import { HiMenu, HiX } from "react-icons/hi";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LEFT - LOGO */}
        <div className="navbar-logo">
          <img src={logo} alt="ShagunPro Logo" />
        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-right">

          {/* DESKTOP LINKS */}
         <ul className="navbar-links">
  <li onClick={() => navigate("/#home")}>Home</li>
  <li onClick={() => navigate("/#about")}>About us</li>
  <li onClick={() => navigate("/#product")}>Products</li>
  <li onClick={() => navigate("/contact")}>Contact us</li>
   {/* <li onClick={() => navigate("/#home")}>Contact us</li> */}
  <li onClick={() => navigate("/#FAQ")}>FAQ</li>
</ul>

          {/* BUTTONS */}


          <div className="navbar-buttons">
            <button
              className="signin-btn"
              onClick={() => navigate("/user/login")}
            >
              Sign In
            </button>

            <button
              className="signup-btn"
              onClick={() => navigate("/user/signup")}
            >
              Sign Up
            </button>
          </div>

          {/* MOBILE MENU ICON */}
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX /> : <HiMenu />}
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="mobile-menu">
        <ul>
  <li onClick={() => { navigate("/#home"); setMenuOpen(false); }}>Home</li>
  <li onClick={() => { navigate("/#about"); setMenuOpen(false); }}>About us</li>
  <li onClick={() => { navigate("/#product"); setMenuOpen(false); }}>Products</li>
  <li onClick={() => { navigate("/contact"); setMenuOpen(false); }}>Contact us</li>
   {/* <li onClick={() => { navigate("/#home"); setMenuOpen(false); }}>Contact us</li> */}
  <li onClick={() => { navigate("/#FAQ"); setMenuOpen(false); }}>FAQ</li>
</ul>

          <div className="mobile-buttons">
            <button
              className="signin-btn"
              onClick={() => navigate("/user/login")}
            >
              Sign In
            </button>

            <button
              className="signup-btn"
              onClick={() => navigate("/user/signup")}
            >
              Sign Up
            </button>
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;