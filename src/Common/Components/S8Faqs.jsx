import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const faqs = [
  {
    question: "Are Shagun Pro products certified?",
    answer:
      "Yes. Our products undergo strict quality and safety testing aligned with industry standards.",
  },
  {
    question: "Do you provide nationwide service?",
    answer: "Yes, we provide nationwide service support across India.",
  },
  {
    question: "Is dealership available?",
    answer: "Yes, dealership opportunities are available. Contact us for details.",
  },
  {
    question: "Do you provide installation support?",
    answer: "Yes, we provide full installation and after-sales support.",
  },
  {
    question: "How can I book a demo or test ride?",
    answer: "You can book a demo by contacting us through our website or helpline.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleFaq = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    
    <div id="FAQ" className="faq-container bg-[black]">
    <section className="bg-[#0E0D0C]  text-white py-8 md:py15 lg:py-20">
      <div className="w-[90%] mx-auto grid md:grid-cols-[40%_60%] gap-5 md:gap-10 items-start">
        
        {/* LEFT SIDE */}
       <div className="flex flex-col justify-center h-full">
          <h2
            className=" text-[24px] md:text-[32px] lg:text-[55px] leading-[120%] tracking-[0.7px] font-medium"
            style={{ fontFamily: "Inter" }}
          >
            Frequently Asked Question
          </h2>

          <p
            className="text-[#92969C] mt-3 md:mt-6 text-[16px] md:text-[21.96px] leading-[120%] font-normal"
            style={{ fontFamily: "Inter" }}
          >
            Find quick answers to common questions about our products.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-black/40 rounded-xl p-4 md:p-10 lg:p-14">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-[#67463A] py-3 md:py-5 lg:py-7 cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center">
                <h4
                  className={` text-[16px] md:text-[18px]  lg:text-[22px] transition ${
                    activeIndex === index
                      ? "text-[#FF6B35]"
                      : "text-[#92969C]"
                  }`}
                  style={{ fontFamily: "Inter" }}
                >
                  {faq.question}
                </h4>

                <span className="text-[#92969C] text-4xl">
                  {activeIndex === index ? (
  <FiChevronUp className="text-[#FF6B35] text-2xl md:text-4xl" />
) : (
  <FiChevronDown className="text-[#92969C] text-2xl md:text-4xl font-[300]" />
)}
                </span>
              </div>

              {activeIndex === index && (
                <p
                  className="mt-4 text-[#92969C] text-[15px] md:text-[18px] leading-relaxed"
                  style={{ fontFamily: "Inter" }}
                >
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default Faq;