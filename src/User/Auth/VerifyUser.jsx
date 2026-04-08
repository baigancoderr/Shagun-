import { useState, useEffect } from "react";
import axios from "axios";
import loginimg from "../../assets/userImages/images/signup.jpeg";
import logo from "../../assets/userImages/Logo/logo_lght1.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";

const VerifyUserPage = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    otp: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60); // Start with 60 seconds
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpRequested, setIsOtpRequested] = useState(false); // Track if OTP was sent
  const [verificationType, setVerificationType] = useState("signup"); // Track if it's login or signup

  useEffect(() => {
    // Pre-fill user_id from navigation state if available
    const user_id = location.state?.user_id || "";
    const type = location.state?.type || "signup"; // Get type from state (login or signup)
    if (user_id) {
      setFormData((prev) => ({ ...prev, user_id }));
      setIsOtpRequested(true); // Assume OTP was sent if user_id is passed
      setTimer(60); // Start timer for resend OTP
      setVerificationType(type); // Set verification type
    }
  }, [location.state]);

  // Separate timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.user_id.trim()) newErrors.user_id = "User ID is required";
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(formData.otp)) newErrors.otp = "OTP must be a 6-digit number";
    return newErrors;
  };

  const handleResendOtp = async () => {
    if (!formData.user_id.trim()) {
      setErrors((prev) => ({ ...prev, user_id: "User ID is required" }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/resend-otp`, {
        user_id: formData.user_id,
        purpose: verificationType,
      });
      toast.success(response.data.message || `New OTP sent!`);
      setTimer(60);
      setIsOtpRequested(true); // Mark OTP as sent
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/verify-otp`, {
        user_id: formData.user_id,
        otp: formData.otp,
        type: verificationType,
      });
      const result = response.data;

      const successMessage = verificationType === "login"
        ? "Login successful! Redirecting..."
        : "Account verified successfully! Redirecting...";

      toast.success(result.message || successMessage);

      // Store token in localStorage/sessionStorage
      const { token } = response.data; // Adjust based on your API response
      if (token) {
        const storage = localStorage.getItem("rememberMe") === "true" ? localStorage : sessionStorage;
        storage.setItem("authToken", token);
      }

      setTimeout(() => navigate("/user/dashboard", { replace: true }), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setErrors((prev) => ({ ...prev, otp: error.response?.data?.message || "Invalid OTP" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row ">
      {/* <div className="w-full h-screen md:w-1/2 bg-[#1a152d] relative"> */}
      <div className="hidden md:block h-screen md:w-1/2 bg-[#1a152d] relative">
        <img src={loginimg} alt="Verify Community" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
          <Link
            to="/"
            className="self-end text-sm text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
            aria-label="Back to website"
          >
            Back to website →
          </Link>
          <div>
            <p className="text-xl font-medium">Join the Community,</p>
            <p className="text-xl font-medium">Grow with us</p>
            <div className="mt-3 flex space-x-1">
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative min-h-screen overflow-y-auto flex justify-center md:w-1/2 p-8 md:p-12 bg-black">
        <Link
          to="/"
          className="absolute top-5 right-5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full transition-colors"
          aria-label="Back to website"
        >
          Back to website →
        </Link>
        <div className="w-full max-w-xl">
          <div className="mb-5">
            <img src={logo} className="w-40" alt="Logo" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-[#fff]">
            {verificationType === "login" ? "Verify Login" : "Verify your account"}
          </h2>
          <p className="text-sm text-[#aaaaaa] mb-6">
            {verificationType === "login"
              ? `Enter the OTP sent for User ID ${formData.user_id || "your account"} to complete login.`
              : `Enter the OTP sent for User ID ${formData.user_id || "your account"} to verify.`
            }
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
           <div>
  <input
    type="text"
    name="user_id"
    value={formData.user_id}
    onChange={handleChange}
    placeholder="User ID"
    className="w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white placeholder-[#555] border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
    disabled={isLoading || isOtpRequested}
    aria-label="User ID input"
  />
  {errors.user_id && (
    <p className="text-red-500 text-xs mt-1" role="alert">
      {errors.user_id}
    </p>
  )}
</div>

            <div>
  <div className="w-full relative rounded-md bg-[#1e1e1e] border border-[#2a2a2a] focus-within:ring-2 focus-within:ring-[#FF6000]">
    <input
      type="text"
      name="otp"
      value={formData.otp}
      onChange={handleChange}
      placeholder="Enter OTP"
      className="bg-transparent text-white placeholder-[#555] h-full px-4 py-3 w-full focus:outline-none"
      disabled={isLoading}
      inputMode="numeric"
      pattern="\d*"
      aria-label="OTP input"
    />
    <button
      type="button"
      disabled={timer > 0 || isLoading}
      onClick={handleResendOtp}
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-nowrap border px-3 rounded-full text-xs py-1 transition-all duration-200 ${
        timer > 0 || isLoading
          ? "cursor-not-allowed bg-[#2a2a2a] text-[#777] border-[#2a2a2a]"
          : "bg-[#FF6000] text-white border-[#FF6000] hover:opacity-90"
      }`}
      aria-label={timer > 0 ? `Resend OTP in ${timer} seconds` : "Resend OTP"}
    >
      {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
    </button>
  </div>
  {errors.otp && (
    <p className="text-red-500 text-xs mt-1" role="alert">
      {errors.otp}
    </p>
  )}
</div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md bg-gradient-to-br from-[#FF6000] to-[#E3090D] text-white hover:opacity-90 transition-colors font-semibold ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={isLoading}
              aria-label="Verify button"
            >
              {isLoading ? "Processing..." : verificationType === "login" ? "Verify & Login" : "Verify Account"}
            </button>

          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-300" />
            <span className="text-gray-600 text-sm">
              Back to{" "}
              <Link
                to={verificationType === "signup" ? "/user/signup" : "/user/login"}
                className="text-[#FF6000] underline-offset-4 hover:underline text-nowrap"
                aria-label="Back to sign up/login"
              >
                {verificationType === "signup" ? "Sign Up" : "Sign In"}
              </Link>
            </span>
            <hr className="flex-1 border-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyUserPage;