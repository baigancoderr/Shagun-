import React from "react";

import img2 from "../assets/innovations/ino1.jpg";
import img4 from "../assets/innovations/ino2.jpg";
import img1 from "../assets/innovations/ino3.jpg";
import img3 from "../assets/innovations/ino4.jpg";
const Innovations = () => {
  return (
    <section className="py-2 bg-[#000]  overflow-hidden">
<div className="w-[98%] bg-[#FFF] rounded-[20px] mx-auto px-2 py-8  md:py-16 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* LEFT HEADING */}
       <div className="text-center lg:text-left w-full">
 <h2 className="text-xl md:text-3xl font-[600] text-[#2E2E2E] leading-snug lg:pl-10">
  One Brand <span className="hidden lg:inline"><br /></span>
  Four Powerful
</h2>

  <span className="text-[24px] md:text-[35px] xl:text-[55px] font-bold text-[#FF6B35] lg:pl-10">
    Innovations
  </span>
</div>

        {/* RIGHT SIDE CONTENT */}
      <div className="flex flex-col gap-4 md:pr-8">

  {/* ROW 1 */}
 <div className="flex flex-col md:flex-row md:justify-end md:items-end gap-4">

  {/* IMAGE */}
  <div className="relative order-1 md:order-2 ">
    <img
      src={img1}
      className="w-full md:w-[355px] h-[180px]  md:h-[140px] object-cover rounded-xl transition-opacity duration-500 hover:opacity-80"
    />

    {/* VERTICAL TEXT */}
    <span className="hidden md:block absolute right-[-70px] top-1/2 -translate-y-1/2 rotate-90 text-orange-500 text-sm">
      Alkaline Ionizer
    </span>
  </div>

  {/* DESCRIPTION */}
  <p className="text-[#5C5C5C] text-[15px] leading-[20px] md:leading-[24px] md:text-[16px] lg:text-[18px] w-full md:max-w-[380px]  order-2 md:order-1">
    Shagun Pro is a diversified multi-product ecosystem focused on
    wellness, mobility, smart automation, and agricultural excellence.
  </p>

</div>


  {/* ROW 2 */}
 <div className="flex flex-col md:flex-row md:justify-end md:items-end gap-6 md:gap-10">

  {/* IMAGES */}
  <div className="flex w-full md:w-auto gap-4 order-1 md:order-2">

    {/* IMAGE 1 */}
    <div className="relative w-full md:w-auto">
      <img
        src={img2}
        className="w-full md:w-[370px] h-[180px]  md:h-[140px] object-cover rounded-xl transition-opacity duration-500 hover:opacity-80"
      />

      <span className="hidden md:block absolute left-[-80px] top-1/2 -translate-y-1/2 rotate-90 text-orange-500 text-sm">
        Scientific Research
      </span>
    </div>

    {/* IMAGE 2 */}
    <div className="relative hidden md:block">
      <img
        src={img3}
        className="w-[203px] h-[180px]  md:h-[140px] object-cover rounded-xl transition-opacity duration-500 hover:opacity-80"
      />

      <span className="absolute right-[-94px] top-1/2 -translate-y-1/2 rotate-90 text-orange-500 text-sm">
        Reliable Performance
      </span>
    </div>

  </div>

  {/* DESCRIPTION */}
  <p className="text-[#5C5C5C] text-[15px] md:text-[16px] lg:text-[18px] w-full md:max-w-[380px] leading-[20px] md:leading-[24px] order-2 md:order-1">
 Shagun Pro is a dynamic multi-sector platform delivering innovative solutions in health, transportation,  and modern farming advancement.
  </p>

</div>


  {/* ROW 3 */}
<div className="flex flex-col md:flex-row md:justify-end md:items-end gap-6 md:gap-16">

  {/* IMAGE */}
  <div className="relative w-full md:w-auto">
    <img
      src={img4}
      className="w-full md:w-[410px] h-[180px] object-cover rounded-xl transition-opacity duration-500 hover:opacity-80"
    />

    <span className="hidden md:block absolute right-[-75px] top-1/2 -translate-y-1/2 rotate-90 text-orange-500 text-sm">
      Premium Design
    </span>
  </div>

  {/* MOBILE TEXT */}
  <p className="text-[#5C5C5C] text-[15px] leading-[20px] w-full md:hidden">
    Serving urban homes, rural communities, and emerging global markets.
  </p>

  {/* DESKTOP ORANGE BOX */}
  <div className="hidden md:flex bg-[#FF6B35] w-[330px] h-[165px] text-white p-8 rounded-xl items-center border border-transparent hover:border-black transition-all duration-300">
    <p className="text-center md:text-[16px] lg:text-[18px] Poppins">
      Serving urban homes, rural communities, and emerging global markets.
    </p>
  </div>

</div>

</div>


      </div>
    </section>
  );
};

export default Innovations;