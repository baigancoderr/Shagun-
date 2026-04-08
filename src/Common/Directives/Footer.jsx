import React from "react";
import "../Styles/Footer.css";
import logo from "../assets/logo.png";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube  } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-inner">

        <div className="footer-container">

          {/* Left */}
          <div className="footer-left">
            <img src={logo} alt="logo" className="footer-logo" />

            <p className="footer-desc">
              Trusted solutions, innovative products, nationwide support,
              and reliable service for smarter, better everyday living.
            </p>

            <div className="footer-social">
              <a href="#">
  <FaXTwitter />
</a>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </div>


          {/* Right */}
          <div className="footer-right">

            <div className="footer-col">
              <h4>Quick Links</h4>
             <Link to="/#home">Home</Link>
  <Link to="/#about">About Us</Link>
  <Link to="/#product">Products</Link>
  <Link to="/#FAQ">FAQ</Link>
  <Link to="/contact">Contact</Link>
            </div>

            <div className="footer-col">
              <h4>Products</h4>
              <a href="#">Alkaline Ionizer</a>
              <a href="#">Family E-Scooter</a>
              <a href="#">Milkish Animal Feed</a>
              <a href="#">Smart Switch System</a>
            </div>

            <div className="footer-col contact">
              <h4>Contact us</h4>

              <div className="footer-input">
                <input type="email" placeholder="Enter email address" />
                <button>send</button>
              </div>
         

            </div>

          </div>
        </div>


        {/* Bottom */}
        <div className="footer-bottom">
          <p>© Copyright 2026, All Rights Reserved by Shagun Pro</p>

          <div className="footer-policy">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Term & Condition</Link>

              {/* <Link >Privacy Policy</Link>
            <Link >Term & Condition</Link> */}
          </div>
        </div>

      </div>

    </footer>
  );
};

export default Footer;