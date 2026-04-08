import Header from "../Directives/Header";
import Footer from "../Directives/Footer";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const gradientStyle = { background: 'linear-gradient(90deg, #FF6000 0%, #E3090D 100%)' };

export default function ContactUs() {
  return (
    <>
      <div className="bg-black">
        <Header />

        <section className="w-full bg-black py-16 px-4 font-['DM_Sans']">
          <div className="max-w-7xl mx-auto">

            {/* PAGE HEADING */}
            <div className="text-center mb-14">
              <h1 className="text-[24px] md:text-[36px] sm:text-[28px] font-semibold text-white mb-4">
                Contact Us
              </h1>
              <p className="text-[16px] text-[#aaaaaa] max-w-2xl mx-auto">
                Have questions about Shagun Pro or our Web3 real estate platform?
                Reach out to us — our team is here to help.
              </p>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

              {/* LEFT – CONTACT INFO */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-[22px] font-semibold text-white mb-4">
                    Get in Touch
                  </h3>
                  <p className="text-[16px] text-[#bbbbbb] leading-[1.6]">
                    Whether you're an investor, partner, or platform user, feel
                    free to contact us for support, inquiries, or collaboration
                    opportunities.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={gradientStyle}>
                      <FaPhoneAlt />
                    </div>
                    <div>
                      <p className="text-[14px] text-[#888]">Phone</p>
                      <p className="text-[16px] font-medium text-white">+995 51000 2291</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={gradientStyle}>
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-[14px] text-[#888]">Email</p>
                      <p className="text-[16px] font-medium text-white">shagunpro@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={gradientStyle}>
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-[14px] text-[#888]">Office</p>
                      <p className="text-[16px] font-medium text-white">Global Web3 Operations (Remote)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT – CONTACT FORM */}
              <div className="bg-[#111111] rounded-2xl p-8 md:p-10 shadow-lg border border-[#2a2a2a]">
  <h3 className="text-[22px] font-semibold text-white mb-6">
    Send Us a Message
  </h3>

  <form className="space-y-5">

    {/* Row 1 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-[14px] mb-1 text-[#aaa]">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full px-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:border-[#FF6000] bg-[#1a1a1a] text-white placeholder-[#555]"
        />
      </div>

      <div>
        <label className="block text-[14px] mb-1 text-[#aaa]">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:border-[#FF6000] bg-[#1a1a1a] text-white placeholder-[#555]"
        />
      </div>
    </div>

    {/* Row 2 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-[14px] mb-1 text-[#aaa]">
          Phone Number
        </label>
        <input
          type="tel"
          placeholder="Enter your phone number"
          className="w-full px-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:border-[#FF6000] bg-[#1a1a1a] text-white placeholder-[#555]"
        />
      </div>

      <div>
        <label className="block text-[14px] mb-1 text-[#aaa]">
          Subject
        </label>
        <input
          type="text"
          placeholder="Enter subject"
          className="w-full px-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:border-[#FF6000] bg-[#1a1a1a] text-white placeholder-[#555]"
        />
      </div>
    </div>

    {/* Message */}
    <div>
      <label className="block text-[14px] mb-1 text-[#aaa]">
        Message
      </label>
      <textarea
        rows="4"
        placeholder="Write your message..."
        className="w-full px-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:border-[#FF6000] bg-[#1a1a1a] text-white placeholder-[#555]"
      ></textarea>
    </div>

    {/* Button */}
    <button
      type="submit"
      className="w-full py-3 rounded-full text-white font-medium hover:opacity-90 transition"
      style={gradientStyle}
    >
      Submit
    </button>
  </form>
</div>

            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
