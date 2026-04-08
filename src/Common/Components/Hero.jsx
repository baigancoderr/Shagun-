import React from "react";
import "../Styles/Hero.css";
import mainScooter from "../assets/HomePages/HeroScooter.png";
import rightImg1 from "../assets/HomePages/Scooter1.png";
import rightImg2 from "../assets/HomePages/Scooter2.png";
import users from "../assets/HomePages/users.jpg";
import user1 from "../assets/HomePages/user1.avif";
import user2 from "../assets/HomePages/user2.jpg";
import HeroWater from "../assets/HomePages/Water11.png";
import waterside1 from "../assets/HomePages/waterside1.png";
import waterside2 from "../assets/HomePages/waterside2.png";
import HeroMobile from "../assets/HomePages/mbl2.png";
import mblside1 from "../assets/HomePages/mblside1.png";
import mblside2 from "../assets/HomePages/mobileside2.png";
import HeroMilk from "../assets/HomePages/MainMilk.png";
import milkside1 from "../assets/HomePages/milkside1.png";
import milkside2 from "../assets/HomePages/milkside2.png";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
const heroData = [
  {
    title: "Smart Living.",
    highlight: "Smart",
    subtitle: "Pure Innovation",
    desc: "Transforming Everyday Life with Advanced Technology & Wellness Solutions, delivering smarter living that empower people and communities every day.",
    mainImg: mainScooter,
    warranty: "2 Years Warranty",
    charging: "10/12",
    chargingText: "Hours Fast Charging",
    side1: rightImg1,
    side2: rightImg2,
    imgClass: "scooter-img",
    positionClass: "scooter-pos",
    containerClass: "scooter-container"
  },
  {
    title: "Pure Water.",
    highlight: "Pure",
    subtitle: "Smart Wellness",
    desc: "Elevating everyday hydration with advanced ionization technology designed to deliver pH-balanced, antioxidant-rich water for modern homes and healthier living. ",
    mainImg: HeroWater,
    warranty: "Trusted Wellness Users",
    charging: "PH",
    chargingText: "balance",
    side1: waterside1,
    side2: waterside2,
    imgClass: "water-img",
    positionClass: "water-pos",
    containerClass: "water-container"
     
  },
    {
    title: "Smart Control.",
    highlight: "Smart",
    subtitle: "Elevated Living",
    desc: "Experience next-generation automation with AI-powered smart switches designed for modern homes, enhanced safety, and effortless control at your fingertips. ",
    mainImg: HeroMobile,
    warranty: "Smart Integrations",
    charging: "AI",
    chargingText: "Powered",
    side1: mblside1,
    side2: mblside2,
     imgClass: "mbl-img",
    positionClass: "mbl-pos",
    containerClass: "mbl-container"
  },
  {
    title: "Pure Nutretion.",
    highlight: "Pure",
    subtitle: "Peak Performance",
    desc: "Premium herbal animal feed scientifically formulated to enhance immunity, improve milk yield, and strengthen overall livestock health for modern dairy success. ",
    mainImg: HeroMilk,
    warranty: "Trusted By  progressive farmers",
    charging: "Complete",
    chargingText: "Herbal Animal Feed",
    side1: milkside1,
    side2: milkside2,
    imgClass: "milk-img",
    positionClass: "milk-pos",
    containerClass: "milk-container"
  },

];

 const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroData.length);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? heroData.length - 1 : prev - 1
    );
  };

  return (
    <section id="home" className="hero">

      {/* Background Big Text */}
      <h1 className="bg-text">Shagun Pro</h1>

     <div className={`hero-container ${heroData[current].containerClass}`}>

        {/* LEFT CONTENT */}
        <div className="hero-left">
          <h2>
  <span className="orange">
    {heroData[current].highlight}
  </span>{" "}
  {heroData[current].title.replace(
    heroData[current].highlight,
    ""
  )}
  <br />
  {heroData[current].subtitle}
</h2>

<p>{heroData[current].desc}</p>

          <div className="verified">
  <div className="verified-images">
    <img src={users} alt="user1" />
    <img src={user1} alt="user2" />
    <img src={user2} alt="user3" />

    <div className="plus-box">+</div>
  </div>

  <div className="verified-text">
    <h4>15K+</h4>
    <p>Verified Buyers</p>
  </div>
</div>

          <div className="hero-buttons">
            <button  onClick={() => navigate("/#product")} className="explore-btn">Explore Products</button>
       <button 
  className="contact-btn"
  // onClick={() => navigate("/contact")}
>
  Contact Us
</button>
          </div>
        </div>

        {/* CENTER IMAGE */}
        <div className="hero-center relative">
        <img
  src={heroData[current].mainImg}
  alt="main"
  className={`main-img ${heroData[current].imgClass} ${heroData[current].positionClass}`}
/>

<div className="warranty">
  {heroData[current].warranty}
</div>

    {/* Pagination for desktop - shows below center scooter */}
    <div className="hidden md:flex items-center justify-center gap-6 mt-6 md:absolute md:bottom-[-70px] md:left-1/2 md:-translate-x-1/2 lg:left-[40%]">

  {/* Left Arrow */}
<button
  onClick={prevSlide}
  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-md hover:scale-105 transition"
>
  <FiChevronLeft size={20} />
</button>

  {/* Progress Lines */}
<div className="flex items-center gap-3">
  {heroData.map((_, index) => (
    <span
      key={index}
      className={`w-6 h-[2px] rounded ${
        current === index
          ? "bg-orange-500"
          : "bg-[#D9D9D9]"
      }`}
    ></span>
  ))}
</div>

  {/* Right Arrow */}
<button
  onClick={nextSlide}
  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-md hover:scale-105 transition"
>
  <FiChevronRight size={20} />
</button>

</div>

          
        </div>

        {/* RIGHT CONTENT */}
        <div className="hero-right">
          <div className="charging">
            <h3>{heroData[current].charging}</h3>
<p>{heroData[current].chargingText}</p>

          </div>

          <div className="side-images">
            <div>
             <img src={heroData[current].side1} alt="side1" />
<img src={heroData[current].side2} alt="side2" />
            </div>
<p className="hidden md:block text-left text-[#676767] mt-0 text-[10px] max-w-[150px]">
  Find The Best Deals On Top Conditions Care
</p>
            
            {/* Pagination for mobile - shows below side images */}
            <div className="mobile-pagination flex md:hidden items-center justify-center gap-6 mt-2">
              {/* Left Arrow */}
            <button
  onClick={prevSlide}
  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-md hover:scale-105 transition"
>
  <FiChevronLeft size={20} />
</button>

              {/* Progress Lines */}
            <div className="flex items-center gap-3">
  {heroData.map((_, index) => (
    <span
      key={index}
      className={`w-6 h-[2px] rounded ${
        current === index
          ? "bg-orange-500"
          : "bg-[#D9D9D9]"
      }`}
    ></span>
  ))}
</div>

              {/* Right Arrow */}
              <button
  onClick={nextSlide}
  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-md hover:scale-105 transition"
>
  <FiChevronRight size={20} />
</button>


            </div>
          </div>

       
        </div>

      </div>
    </section>
  );
};

export default Hero; 