import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from '../Directives/Header'
import About from "../Components/About"
import S2Whychoose from '../Components/S2WhyChoose'
import S6Quality from '../Components/S6Quality'
import S8Faqs from '../Components/S8Faqs'
import Footer from '../Directives/Footer'
import GrowthStory from "../Components/GrowthStory ";
import Testimonials from "../Components/Testimonials";
import Innovations from "../Components/Innovations";
import Hero from "../Components/Hero";
import ProductSection from "../Components/ProductSection";



function HomePage() {

  const location1 = useLocation();
  useEffect(() => {
  if (location1.hash) {
    const id = location1.hash.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100); // important delay
    }
  }
}, [location1]);

  return (
    
    <>
      <div className="bg-white  ">

      <Header /> 
      <Hero/>
      <Innovations/>
      <About />
     
      <S6Quality />
      <GrowthStory/>
        <ProductSection/>
       <S2Whychoose />
      <Testimonials/>
      <S8Faqs />
      <Footer />  

    
      </div>
    </>
  )
}

export default HomePage;
