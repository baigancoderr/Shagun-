import React from "react";
import growthImg from "../assets/successStory/success.png";

const GrowthStory = () => {
  return (
    <section className="bg-black text-white py-8 md:py-16 lg:py-28">
      <div className="w-[90%] mx-auto  px-1 md:px-4 md:px-6 grid md:grid-cols-2 gap-6 md:gap-14 items-center">

        {/* Left Side */}
        <div className="md:w-full">
          <div className="rounded-2xl overflow-hidden">
            <img
              src={growthImg}
              alt="Growth Chart"
              className="w-full h-auto object-cover"
            />
          </div>

          <p className="mt-4 text-[#FFFFFF] font-[300] font-[Inter]  text-[16px] leading-[25px]">
            Shagun Pro began with a simple mission — improve daily life — and
            today stands as a multi-category innovation brand.
          </p>
        </div>

        {/* Right Side */}
        <div className="md:w-full">
          <h2 className="font-[Inter] font-[500] text-[24px] md:text-[36px] lg:text-[55px] leading-tight mb-6 lg:pl-6">
            Our <span className="text-[#FF6B35]">Growth & </span>
            <span className="text-[#FF6B35]">Success</span> Story
          </h2>

          <div className="relative pl-6 space-y-2">

            {/* Gradient Border */}
            <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-black via-[#FF6B35] to-black"></div>

            {[
              "Thousands of satisfied domestic customers",
              "Rapid distributor expansion in regional markets",
              "Growing demand in tier-2 & tier-3 cities",
              "Strong dealer network development",
              "Positive word-of-mouth growth",
            ].map((item, i) => (
              <p
                key={i}
                className="font-[Inter] font-[300] text-[16px] md:text-[18px] lg:text-[22px] leading-[25px] md:leading-[30px] lg:leading-[40px] text-[#FFFFFF] "
              >
                • {item}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default GrowthStory;