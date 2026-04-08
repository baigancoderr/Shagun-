import React, { useState, useEffect } from "react";

import img1 from "../assets/About/about1.jpg";
import img2 from "../assets/About/about2.jpg";
import img3 from "../assets/About/about3.jpg";
import img4 from "../assets/About/about4.jpg";
import visionImg from "../assets/About/vision.png";
import { motion, AnimatePresence } from "framer-motion";

const industries = [
  "HEALTH & WATER PURIFICATION",
  "ELECTRIC MOBILITY",
  "AGRICULTURAL NUTRITION",
  "SMART HOME AUTOMATION",
];
const industryImages = [
  img1, // HEALTH & WATER PURIFICATION
  img2, // ELECTRIC MOBILITY
  img3, // AGRICULTURAL NUTRITION
  img4, // SMART HOME AUTOMATION 
];

const About = () => {
  const [active, setActive] = useState(0);
  const [images, setImages] = useState([img1, img2, img3, img4]);
const rotateImages = () => {
  setImages((prev) => [
    prev[1], // Left1 -> Left2
    prev[2], // Active -> Left1
    prev[3], // Right -> Active
    prev[0], // Left2 -> Right
  ]);
};
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % industries.length);
      rotateImages();
    }, 2000); // 2 sec

    return () => clearInterval(interval);
  }, []);
  

  return (
    <>
    <section id="about" className="w-full bg-black flex justify-center pt-5 md:pt-10 lg:pt-20 font-[Inter]">
  <div className="w-[93%] flex flex-col md:flex-row justify-between gap-5 ">

        {/* LEFT SIDE */}
        <div className="lg:w-1/2">

          <h2 className="text-white font-medium text-[28px] md:text-[25px] lg:text-[55px] leading-tight">
            About <span className="text-[#FF6B35]">Shagun Pro</span>
          </h2>

          <p className="mt-3 md:mt-10 text-[14px] md:text-[16px] text-[#cfcfcf] md:hidden">
  Shagun Pro is a forward-thinking innovation brand committed to improving
  everyday life through smart technology and wellness-driven solutions.
</p>

          <p className="mt-3 md:mt-10 md:mt-14 text-[18px] text-white font-normal">
            We operate across multiple industries:
          </p>

          <div className="mt-6 flex flex-col gap-3">

            {industries.map((item, index) => (
              <div
                key={index}
                onClick={() => {
  setActive(index);
  rotateImages();
}}
                className={`relative px-5 py-4 rounded-[15px] cursor-pointer text-white  text-[14px] lg:text-[18px] font-light border w-full md:w-[90%] overflow-hidden transition-all duration-300
                ${
                  active === index
                    ? "border-[#FF6B351C] bg-transparent shadow-[0px_7.04px_12.33px_rgba(0,0,0,0.05),_-0.44px_0.44px_5.72px_rgba(255,107,53,0.25)_inset]"
                    : "bg-[#EC70290D] border-[#2B2B2B]"
                }`}
              >
                {item}

                {/* ORANGE GLOW */}
                <span
                  className={`absolute left-[-80px] top-[-40px] w-[220px] h-[160px] blur-[22px] bg-[radial-gradient(circle_at_left,rgba(255,68,0,0.55)_0%,rgba(255,68,0,0.35)_30%,rgba(255,68,0,0.15)_55%,transparent_75%)] transition-transform duration-500 ${
                    active === index ? "translate-x-0" : "-translate-x-full"
                  }`}
                />
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:w-1/2 flex flex-col items-center">

          <p className="hidden md:block text-[#cfcfcf] text-base text-right max-w-[540px] mb-10 self-end md:pr-10">
  Shagun Pro is a forward-thinking innovation brand committed to improving
  everyday life through smart technology and wellness-driven solutions.
</p>

          {/* IMAGE STACK */}
          <div className="relative w-full max-w-[450px] md:max-w-[640px] h-[260px] md:h-[300px] lg:h-[380px] overflow-hidden mx-auto">

            {/* MAIN IMAGE */}
<div className="absolute left-1/2 top-1/2  -translate-x-[50%]  md:-translate-x-[30%] -translate-y-1/2
z-10 p-[1px] rounded-[14px] bg-[linear-gradient(180deg,#FF6B35_0%,#000000_100%)] shadow-[1px_1px_10.9px_0px_#000000]">              <img
        
  src={images[2]} 
                className="w-[160px] sm:w-[200px] md:w-[250px] opacity-80 lg:w-[270px] h-[220px] md:h-[300px] lg:h-[350px] rounded-[14px] object-cover"
                alt=""
              />
            </div>

            {/* LEFT IMG 2 */}
<div className="absolute left-[6%] md:left-[17%] top-1/2 -translate-y-1/2
z-[8] p-[1px] rounded-[14px] bg-[linear-gradient(180deg,#FF6B35_0%,#000000_100%)] shadow-[1px_1px_10.9px_0px_#000000]">              <img
                 src={images[0]} 
                className="w-[120px] sm:w-[150px] md:w-[170px] lg:w-[200px] h-[200px] md:h-[260px] lg:h-[315px] rounded-[14px] opacity-85 object-cover"
                alt=""
              />
            </div>

            {/* LEFT IMG 1 */}
<div className="absolute  left-[15%] md:left-[27%] top-1/2 -translate-y-1/2
z-[9] p-[1px] rounded-[14px] bg-[linear-gradient(180deg,#FF6B35_0%,#000000_100%)] shadow-[1px_1px_10.9px_0px_#000000]">              <img
               src={images[1]}
                className="w-[120px] sm:w-[150px] opacity-70 md:w-[170px] lg:w-[200px] h-[200px] md:h-[260px] lg:h-[315px] rounded-[14px] opacity-70 object-cover"
                alt=""
              />
            </div>

            {/* RIGHT IMAGE */}
<div className="absolute right-[8%]  md:right-[5%] top-1/2 -translate-y-1/2
z-[2] p-[1px] rounded-[14px] bg-[linear-gradient(180deg,#FF6B35_0%,#000000_100%)] shadow-[1px_1px_10.9px_0px_#000000]">              <img
                src={images[3]} 
                className="w-[120px]  opacity-70 sm:w-[150px] md:w-[170px] lg:w-[200px] h-[200px] md:h-[260px] lg:h-[315px] rounded-[14px] opacity-85 object-cover"
                alt=""
              />
            </div>

          </div>

        </div>

      </div>

      
    </section>
    {/* VISION MISSION */}
<div className="px-2 lg:px-12 mx-auto grid md:grid-cols-2 gap-2 lg:gap-8 bg-[#000] pb-10 lg:pb-20">

  {/* VISION */}
  <div className="relative bg-black  p-6 flex gap-4 items-start overflow-hidden">

    {/* LEFT GRADIENT BORDER */}
<div className="absolute left-0 top-0 h-full w-[2px] bg-[linear-gradient(180deg,#000000_0%,#FF6B35_45.19%,#000000_100%)]"></div>   

    <div>
      <div className="flex  items-center gap-3">
       <img
      src={visionImg}
      className="w-[25px] h-[25px] object-contain"
      alt=""
    />
      <h3 className="text-white text-[20px] font-medium">
        Vision
      </h3>
      </div>

      <p className="text-[#cfcfcf] text-[14px] md:text-[15px] mt-2 leading-relaxed w-full max-w-[100%] lg:max-w-[70%] Inter">
       To become a globally respected brand delivering smart, sustainable, and wellness-driven innovations for modern living.
      </p>
    </div>
    
  </div>


  {/* MISSION */}
  <div className="relative bg-black p-6 flex gap-4 items-start overflow-hidden 
w-full max-w-[100%] lg:max-w-[85%] ml-auto">

  {/* LEFT GRADIENT BORDER */}
  <div className="absolute left-0 top-0 h-full w-[2px] bg-[linear-gradient(180deg,#000000_0%,#FF6B35_45.19%,#000000_100%)]"></div>   

  <div>
    <div className="flex items-center gap-3">
      <img
        src={visionImg}
        className="w-[25px] h-[25px] object-contain"
        alt=""
      />
      <h3 className="text-white text-[20px] font-medium">
        Mission
      </h3>
    </div>

    <p className="text-[#cfcfcf] text-[15px] mt-2 leading-relaxed Inter">
      To provide high-quality, affordable, and technologically advanced solutions that empower families, farmers, and future-ready homes.
    </p>
  </div>

</div>

</div>
 

    </>

  );
};

export default About;