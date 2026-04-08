 import scooter from "../assets/HomePages/HeroScooter.png";
import img1 from "../assets/product section/scooter1.png";
import img2 from "../assets/product section/scooter2.png";
import milk from "../assets/product section/milk.png"
import smart from "../assets/product section/smart.png"
import water from "../assets/product section/Water.png"
import water1 from "../assets/product section/water1.png"
import smart1 from "../assets/product section/smart1.png"
import milk1 from "../assets/product section/milk1.png"
import { MdArrowOutward } from "react-icons/md";
import '../Styles/Productsection.css';

import star from "../assets/product section/Star 1.png"; 
import { IoSunny } from "react-icons/io5";   

export default function ProductSection() {
    const products = [
  {
    id: 1,
    title: "India’s Smart Family E-Scooter",
    desc: "Designed for performance, safety, and smart connectivity.A powerful electric mobility solution built for Indian roads and global performance standards.",
    mainImg: scooter,
    img1: img1,
    img2: img2,
    color: "#FF6B35",
      headingColor:"#383838",
  descColor:"#383838"
  },
  {
    id: 2,
    title: "Milkish – Premium Animal Feed",
    desc: "Designed for performance, safety, and smart connectivity.A powerful electric mobility solution built for Indian roads and global performance standards.",
    mainImg: milk,
    img1: milk1,
    img2: milk1,
    color: "#9AC13B",
      headingColor:"#9AC13B",
  descColor:"#9AC13B"
  },
  {
    id: 3,
    title: "Alkaline Ionizer – Pure Water, Healthy Life",
    desc: "Designed for performance, safety, and smart connectivity.A powerful electric mobility solution built for Indian roads and global performance standards.",
    mainImg: water,
    img1: water1,
    img2: water1,
    color: "#0A36F7",
      headingColor:"#0A36F7",
  descColor:"#0A36F7"
  },
    {
    id: 4,
    title: "Smart Switch System – Smart Living",
    desc: "AI-powered intelligent switch system combining safety, automation, and luxury design. Perfect for modern apartments, villas, offices, and hospitality projects.",
    mainImg: smart,
    img1: smart1,
    img2: smart1,
    color: "#584135",
      headingColor:"#584135",
  descColor:"#584135"
  },

];

  return (
    <section id="product" className="bg-black text-white py-6 md:py-6 px-4 md:px-6 relative">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-2">
        
        {/* Left Heading */}
        <h2 className=" text-[24px] md:text-[30px] lg:text-[40px] xl:text-[55px] font-[400] leading-[40px] lg:leading-[55px]">
          Our Innovative <span className="text-[#FF6B35] font-[400] ">Products</span>
        </h2>

        {/* Right Description */}
        <p className="max-w-xl text-[#FFFFFF] text-[16px]   lg:text-[22px] ">
          Explore our range of innovative products designed to simplify and
          enhance everyday living.
        </p>

      </div>


      {/* SVG Background Container */}
           {products.map((product) => (
<div key={product.id} className="lg:hidden bg-[#f1f1f1] rounded-2xl p-3 md:p-10 mb-4">
  
  <div className="flex flex-col gap-4">

    {/* Left Content */}
    <div className="space-y-4">
      <h3 className="text-[24px] md:text-[40px] pl-3 pt-3 font-[500] text-[#383838] leading-[30px] md:leading-[45px]">
     {product.title}
      </h3>

      <p className="text-[#383838] text-[15px]  pl-3 md:text-[18px] leading-[17px] md:leading-0">
        {product.desc}
      </p>
    </div>

    {/* Scooter Image */}
    <div className="flex justify-center">
      <img
          src={product.mainImg}
        alt="scooter"
        className="w-full max-w-[420px] object-contain"
      />
    </div>

    {/* Right Side Content */}
    <div className="flex flex-row items-center justify-center gap-4">

     <img src={product.img1} className="rounded-lg w-full max-w-[120px]"/>
<img src={product.img2} className="rounded-lg w-full max-w-[120px]"/>

    

    </div>
    {/* MOBILE ORANGE BOX */}
<div className="lg:hidden mt-2 flex justify-center">

 <div
  className="relative rounded-[25px] w-full max-w-[350px] py-8 px-6 flex flex-col items-center gap-3"
  style={{
    background: product.color,
    boxShadow:
      "-18px -18px 1px 0px #0000004D inset, 0px 4px 4px 0px #00000040",
  }}
>

    <p className="text-white font-semibold text-[22px] mb-2">
      Explore More
    </p>

 <button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
  key Features

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

  <button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
 Performance Edges

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

<button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
  Success Story

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

  </div>

</div>

  </div>

</div>

           ))}

    {products.map((product, index) => (
  <div key={product.id} className="sticky top-[5px]  relative w-full min-h-[620px] xl:min-h-[720px] hidden lg:block mb-8">
    

        {/* SVG */}
 <svg
  viewBox="0 0 1383 766"
  preserveAspectRatio="none"
  className="absolute inset-0 w-full h-full z-0"
>
  <path
    d="M0 28C0 12.536 12.536 0 28 0H1355C1370.46 0 1383 12.536 1383 28V708C1383 723.464 1370.46 736 1355 736H691.5H451C435.536 736 423 723.464 423 708V482.64C423 467.176 410.464 454.64 395 454.64H28C12.536 454.64 0 442.104 0 426.64V368V28Z"
    fill={index === 1 ? "#202020" : "#f1f1f1"}
  />
</svg>


      


        {/* Content */}
    <div className="relative z-10 flex flex-col md:flex-row p-10 pt-16 ">

          {/* Left 40% */}
          <div className="md:w-[48%] space-y-4">
<h3
  className="text-[40px] xl:text-[55px] font-[500] leading-[45px] xl:leading-[60px]"
  style={{ color: product.headingColor }}
>              {product.title}
            </h3>

         <p
  className="inter text-[18px]"
  style={{ color: product.descColor }}
>
            {product.desc}
            </p>
          </div>


          {/* Middle 40% */}
    <div className="md:w-[43%] flex justify-center items-center relative">

  {/* Outer Circle */}
{/* Outer Circle */}
<div
  className="absolute w-[400px] h-[400px] xl:w-[520px] xl:h-[520px] rounded-full circle-animate-1"
  style={{
    background: product.color,
    opacity: 0.08
  }}
></div>

{/* Middle Circle */}
<div
  className="absolute w-[300px] h-[300px] xl:w-[400px] xl:h-[400px] rounded-full circle-animate-2"
  style={{
    background: product.color,
    opacity: 0.15
  }}
></div>

{/* Inner Circle */}
<div
  className="absolute w-[200px] h-[200px] xl:w-[280px] xl:h-[280px] rounded-full circle-animate-3"
  style={{
    background: product.color,
    opacity: 0.25
  }}
></div>

  {/* Main Product Image */}
  <img
    src={product.mainImg}
    alt="product"
    className="relative z-10 w-full max-w-[450px] object-contain"
  />

</div>


          {/* Right 20% */}
<div className="md:w-[13%] flex flex-col items-end gap-4 md:pt-16 lg:pt-20">
            <img
              src={product.img1}
              alt=""
              className="rounded-lg"
            />

            <img
             src={product.img2}
              alt=""
              className="rounded-lg"
            />

          <p className=" text-[9px] xl:text-xs text-gray-500 text-left max-w-[130px]  mx-auto">
  Find the best deals on top condition cars
</p>





   <div className="relative w-[110px] h-[110px] xl:w-[150px] xl:h-[150px] mt-4 flex items-center justify-center">

  {/* Background Circles */}
  <div className="absolute w-[170px] h-[170px] rounded-full bg-[#000] opacity-[0.05]"></div>
  <div className="absolute w-[135px] h-[135px] rounded-full bg-[#000] opacity-[0.10]"></div>
  <div className="absolute w-[135px] h-[135px] rounded-full bg-[#000] opacity-[0.10]"></div>
  <div className="absolute w-[95px] h-[95px] rounded-full bg-[#000] opacity-[0.15]"></div>

  {/* Center Star */}
  <img
    src={star}
    alt=""
    className="w-8 h-8 object-contain relative z-10"
  />

  {/* TOP TEXT */}
  <p className="absolute text-[#000] top-0 left-1/2 -translate-x-1/2 text-[18px] tracking-[0.4px]">
    OUR
  </p>

  {/* BOTTOM TEXT */}
  <p className="absolute text-[#000] bottom-0 left-1/2 -translate-x-1/2 text-[18px] tracking-[0.4px]">
    OUR
  </p>

  {/* LEFT TEXT */}
  <p className="absolute text-[#000] left-[-18%] top-1/2 -translate-y-1/2 -rotate-90 text-[18px] tracking-[0.4px]">
    SERVICE
  </p>

  {/* RIGHT TEXT */}
  <p className="absolute text-[#000] right-[-18%] top-1/2 -translate-y-1/2 rotate-90 text-[18px] tracking-[0.4px]">
    SERVICE
  </p>

  {/* STAR ICONS */}
  <IoSunny className="absolute top-2 left-2 text-[12px] text-[#000]" />
  <IoSunny className="absolute top-2 right-2 text-[12px] text-[#000]" />
  <IoSunny className="absolute bottom-2 left-2 text-[12px] text-[#000]" />
  <IoSunny className="absolute bottom-2 right-2 text-[12px] text-[#000]" />

</div>
 
            

          </div>

        </div>


        {/* Left Bottom Extra Div */}
  {/* Left Bottom Extra Div */}
<div className="relative lg:absolute lg:bottom-7 mt-10 lg:mt-0 z-20 hidden lg:flex justify-start">
    <div
className="width-setter relative rounded-[30px] w-[430px]  h-[225px] xl:h-[260px]  flex items-center justify-center"
style={{
background: product.color,
boxShadow:"-22px -22px 1px 0px #0000004D inset, 0px 4px 4px 0px #FF6B3554"
}}
>

    {/* Vertical Text */}
    <div className=" verticle-text absolute left-[-22px] sm:left-[-35px] md:left-[-55px] top-1/2 -translate-y-1/2">
      <p className="font-bold text-[14px] sm:text-[18px] md:text-[30px] rotate-[-90deg] whitespace-nowrap text-transparent [-webkit-text-stroke:0.4px_white]">
        Explore More
      </p>
    </div>

    {/* Buttons */}
   <div className="button-res flex flex-col justify-center gap-3 sm:gap-1 xl:gap-4 w-full  max-w-[225px] xl:max-w-[260px]">

   <button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
 Key Features

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

   <button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
Performances Edges

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

     <button
  className="group flex items-center justify-between w-full text-white px-4 py-2.5 rounded-lg text-sm sm:text-base font-[200] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  style={{ 
    background: product.color,
    boxShadow: "0px 4px 4px 0px #00000040"
  }}
>
  Success Story

  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
    <MdArrowOutward className="text-black text-[14px]" />
  </div>

</button>

    </div>

  </div>
</div>


      </div>
    
))}

    </section>
  );
} 