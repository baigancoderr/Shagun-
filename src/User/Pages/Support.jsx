import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaCommentDots,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import Footer from "../Components/Comman/Footer";
import ReCAPTCHA from "react-google-recaptcha";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorObj = {};

    if (!formData.name.trim()) errorObj.name = "Name is required";
    if (!formData.email.trim()) errorObj.email = "Email is required";
    if (!formData.phone.trim()) errorObj.phone = "Phone number is required";
    if (!formData.subject.trim()) errorObj.subject = "Subject is required";
    if (!formData.message.trim()) errorObj.message = "Message is required";

    if (Object.keys(errorObj).length > 0) {
      setErrors(errorObj);
      Object.values(errorObj).forEach((msg) => toast.error(msg));
      return;
    }

    try {
      setLoading(true);
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("No authentication token found. Please log in.");
        return;
      }

      await axios.post(
        `${appConfig.baseURL}/user/sendsupportemail`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Support request sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        notRobot: false,
      });
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send support request.");
      console.error("Error sending support:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      <div className="flex justify-center ">
        <form onSubmit={handleSubmit} className=" w-[40rem] theme-card-style border-gradient p-5     gap-8">
          <h2 className="text-xl font-bold text-[#FF6000] mb-4">Support Form</h2>
          <div className="     space-y-6">
            {/* Name */}
            <div>
              <label className="text-sm mb-1 font-bold flex items-center gap-2">
                <FaUser className="text-[#FF6000]" /> Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full bg-transparent  mt-2 border-b ${errors.name ? "border-red-500" : "border-[#FF6000]"
                  } focus:outline-none text-[#FF6000]`}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm mb-1 font-bold flex items-center gap-2">
                <FaEnvelope className="text-[#FF6000]" /> Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-transparent  mt-2 border-b ${errors.email ? "border-red-500" : "border-[#FF6000]"
                  } focus:outline-none text-[#FF6000]`}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm mb-1 font-bold flex items-center gap-2">
                <FaPhone className="text-[#FF6000]" /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full bg-transparent  mt-2 border-b ${errors.phone ? "border-red-500" : "border-[#FF6000]"
                  } focus:outline-none text-[#FF6000]`}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm mb-1 font-bold flex items-center gap-2">
                <FaTag className="text-[#FF6000]" /> Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Enter subject of your query"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full bg-transparent  mt-2 border-b ${errors.subject ? "border-red-500" : "border-[#FF6000]"
                  } focus:outline-none text-[#FF6000]`}
              />
              {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="text-sm mb-1 font-bold flex items-center gap-2">
                <FaCommentDots className="text-[#FF6000]" /> Message
              </label>
              <textarea
                name="message"
                rows="4"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleInputChange}
                className={`w-full mt-2 bg-transparent border-b ${errors.message ? "border-red-500" : "border-[#FF6000]"
                  } focus:outline-none text-[#FF6000]`}
              />
              {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
            </div>

            {/* Submit */}
           <button
  type="submit"
  className="w-full mt-4 rounded-xl px-6 py-3 text-xl font-medium text-white
  bg-gradient-to-r from-[#FF6000] to-[#E3090D]
  shadow-[0_8px_20px_rgba(255,96,0,0.25)]
  border border-[#ffffff1a]
  transition-all duration-300 ease-out
  hover:-translate-y-1 hover:scale-[1.01]
  hover:shadow-[0_14px_30px_rgba(255,96,0,0.35)]
  hover:from-[#ff6a1a] hover:to-[#f11217]
  active:translate-y-0 active:scale-[0.99]
  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
  disabled={loading}
>
  {loading ? "Sending..." : "Send"}
</button>
          </div>

        </form>
      </div>
      <Footer />
    </>
  );
};

export default Support;