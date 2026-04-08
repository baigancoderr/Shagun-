import React from "react";
import '../Styles/ChooseUs.css';

import whyus from "../assets/ChooseUs/choose1.png";
import choose1 from "../assets/ChooseUs/chhose1.png";
import choose2 from "../assets/ChooseUs/chhose2.png";
import choose3 from "../assets/ChooseUs/chhose3.png";
import choose4 from "../assets/ChooseUs/chhose4.png";
import choose5 from "../assets/ChooseUs/chhose5.png";
import choose6 from "../assets/ChooseUs/chhose6.png";



import { FaCogs, FaHeadset, FaGlobe, FaShieldAlt, FaMicrochip, FaIndustry } from "react-icons/fa";

const ChooseUs = () => {
  const features = [
    {
      icon: <FaShieldAlt />,
      img:choose1,
      title: "Quality Assured",
      desc: "Consistent standards you can trust"
    },
    {
      icon: <FaMicrochip />,
      img:choose6,
      title: "Smart Technology Integration",
      desc: "Advanced features for smarter living"
    },
    {
      icon: <FaHeadset />,
      img:choose2,
      title: "Dedicated Customer Support",
      desc: "Always ready to help you"
    },
    {
      icon: <FaIndustry />,
      img:choose5,
      title: "Innovation Driven Manufacturing",
      desc: "Built with future-focused technology"
    },
    {
      icon: <FaGlobe />,
      img:choose3,
      title: "Nationwide Service Network",
      desc: "Support available across the country"
    },
    {
      icon: <FaCogs />,
      img:choose4,
      title: "Expanding International Reach",
      desc: "Growing presence across global markets"
    }
  ];

  return (
    <section className="choose-section">

      <div className="choose-container">

        {/* LEFT SIDE */}
        <div className="choose-left">

          <h2>
            Why Choose <span>Shagun Pro?</span>
          </h2>

          <p className="choose-desc">
            Choose Shagun Pro for reliable innovation, trusted performance,
            and dependable everyday solutions.
          </p>

          <div className="choose-features">
            {features.map((item, index) => (
              <div className="feature" key={index}>
               <div className="feature-icon">
  <img src={item.img} alt={item.title} />
</div>

                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>


        {/* RIGHT SIDE IMAGE */}
        <div className="choose-right">
          <img src={whyus} alt="Why Us" />
        </div>

      </div>

    </section>
  );
};

export default ChooseUs;