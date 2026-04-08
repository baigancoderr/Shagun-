import React, { useState, useEffect } from "react";
import CustomShape from "./CustomShape";
import aadmi from "../assets/Testimonials/1.jpg";
import aurat from "../assets/HomePages/user2.jpg";

import aadmi1 from "../assets/HomePages/user1.avif";
import left from "../assets/Testimonials/left.png";
import right from "../assets/Testimonials/right.png";

const Testimonials = () => {
const testimonials  = [
  {
    name: "Hannah Schmitt",
    role: "Wellness Consultant, Mumbai",
    text: "The alkaline ionizer completely upgraded our family health routine.",
    img: aadmi,
  },
  {
    name: "John Carter",
    role: "Working Professional, Delhi",
    text: "Smooth acceleration and strong battery backup. Perfect for daily commuting.",
    img: aurat,
  },
  {
    name: "Rahul Patel",
    role: "Dairy Farmer, Gujarat",
    text: "Milk production increased noticeably.Smooth acceleration and strong battery backup.",
    img: aadmi1,
  },
];

const [index, setIndex] = useState(0);

const nextSlide = () => {
  setIndex((prev) => (prev + 1) % testimonials.length);
};
useEffect(() => {
  const interval = setInterval(() => {
    nextSlide();
  }, 3000); // 4 second

  return () => clearInterval(interval);
}, [index]);

const prevSlide = () => {
  setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
};
const leftIndex = (index - 1 + testimonials.length) % testimonials.length;
const centerIndex = index;
const rightIndex = (index + 1) % testimonials.length;

    return (
        <section className="relative bg-black text-white  py-10 md:py-10 lg:py-20 overflow-hidden">

            {/* ORANGE GLOW BACKGROUND */}
            {/* ORANGE GLOW BACKGROUND */}

            <div className="
absolute 
top-[-120px] left-[-120px] 
w-[260px] h-[260px]
md:top-[-160px] md:left-[-160px]
md:w-[380px] md:h-[380px]
lg:top-[-200px] lg:left-[-200px]
lg:w-[500px] lg:h-[500px]
bg-[#FF6B35] opacity-40 blur-[180px] md:blur-[220px] lg:blur-[251px]
rounded-full
"></div>

            <div className="
absolute 
bottom-[-120px] right-[-120px]
w-[260px] h-[260px]
md:bottom-[-160px] md:right-[-160px]
md:w-[380px] md:h-[380px]
lg:bottom-[-200px] lg:right-[-200px]
lg:w-[500px] lg:h-[500px]
bg-[#FF6B35] opacity-40 blur-[180px] md:blur-[220px] lg:blur-[251px]
rounded-full
"></div>
            {/* HEADING + DESC */}
            <div className="md:max-w-[95%]  lg:max-w-[90%] mx-auto flex flex-col md:flex-row items-center justify-between mb-10 md:mb-10 lg:mb-16 px-6">

                {/* LEFT HEADING */}
                <h2 className="text-center md:text-left w-full md:w-auto text-[24px] md:text-[36px] lg:text-[55px] font-[400] leading-[30px] md:leading-[40px]  lg:leading-[50px]">
                    <span className="text-[#FF6B35]">Trusted</span> by Our Customers
                </h2>

                {/* RIGHT DESC */}
                <p className="text-[#ffffff] md:text-[16px] lg:text-[24px] mt-4 md:mt-0 text-center md:text-left max-w-lg">
                    Honest feedback from customers who trust and use Shagun Pro
                </p>

            </div>

            {/* TESTIMONIAL CARDS */}
            <div className="relative flex justify-center items-center ">

                {/* LEFT PAGINATION */}
                <button onClick={prevSlide}  className="absolute left-6 w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white text-black shadow-[0px_0px_10px_0px_#0000001A] z-10">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* LEFT CARD */}
                <div className="relative w-[345px] hidden md:block">

                    <img src={left} className="w-full" />

                    <div className="absolute top-[10px] left-1/2 -translate-x-1/2 text-center w-[80%]">

                       <img
  src={testimonials[leftIndex].img}
  className="md:w-12 md:h-12 lg:w-20 lg:h-20 rounded-full border-4 border-black mx-auto object-cover bg-white"
/>

                        <h3 className="font-semibold mt-3">
                          {testimonials[leftIndex].name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                           {testimonials[leftIndex].role}
                        </p>

                        <p className="text-xs text-gray-300 mt-2">
                           {testimonials[leftIndex].text}
                        </p>

                    </div>

                </div>


                {/* CENTER CARD */}
                <div className="relative w-[440px] px-4 md:px-0 ">

                    <CustomShape />

                    <div className="absolute top-[-18px] flex flex-col items-center justify-center px-10 text-center">

                      <img
  src={testimonials[centerIndex].img}
  className="w-16 h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full mb-6 md:mb-2 lg:mb-4 border-4 border-black object-cover bg-white"
/>

                        <h3 className="md:text-[20px] lg:text-[24px] font-semibold">
                         {testimonials[centerIndex].name}
                        </h3>

                        <p className="md:text-[14px] lg:text-[18px] text-[#CFCFCF] mb-3">
                         {testimonials[centerIndex].role}
                        </p>

                        <p className="text-[16px] lg:text-[18px] text-[#CFCFCF] leading-[24px]">
                           {testimonials[centerIndex].text}
                        </p>

                    </div>

                </div>


                {/* RIGHT CARD */}
                <div className="relative w-[345px] hidden md:block">

                    <img src={right} className="w-full" />

                    <div className="absolute top-[10px] left-1/2 -translate-x-1/2 text-center w-[80%]">

                       <img
  src={testimonials[rightIndex].img}
  className="md:w-12 md:h-12 lg:w-20 lg:h-20 rounded-full border-4 border-black mx-auto object-cover bg-white"
/>

                        <h3 className="font-semibold mt-3">
                           {testimonials[rightIndex].name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                         {testimonials[rightIndex].role}
                        </p>

                        <p className="text-xs text-gray-300 mt-2">
                        {testimonials[rightIndex].text}
                        </p>

                    </div>

                </div>


                {/* RIGHT PAGINATION */}
                <button  onClick={nextSlide} className="absolute right-6 w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white text-black shadow-[0px_0px_10px_0px_#0000001A] z-10">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>

            </div>

        </section>
    );
};

export default Testimonials;