import { useState, useEffect } from "react";
import axios from "axios";
import loginimg from "../../assets/userImages/images/signup.jpeg";
import logo from "../../assets/userImages/Logo/logo_lght1.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    otp: "",
    remember: localStorage.getItem("rememberMe") === "true",
  });
  const [errors, setErrors] = useState({ user_id: "", password: "", otp: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    const storedToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (storedToken && window.location.pathname !== "/user/dashboard") {
      console.log("Token found, redirecting to /user/dashboard:", storedToken);
      navigate("/user/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.user_id) {
      newErrors.user_id = "User ID is required.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (otpRequested && !formData.otp) {
      newErrors.otp = "OTP is required.";
    } else if (otpRequested && !/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be a 6-digit number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async () => {
    if (!formData.user_id) {
      setErrors((prev) => ({
        ...prev,
        user_id: "User ID is required.",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/resend-otp`, {
        user_id: formData.user_id,
        purpose: "login",
      });
      const { message } = response.data;
      toast.success(message || "OTP sent!");
      setOtpRequested(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP.";
      if (errorMessage === "User not found") {
        setErrors((prev) => ({ ...prev, user_id: "User not found." }));
      } else if (errorMessage === "Too many OTP resend attempts. Please try again later.") {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!otpRequested) {
      await handleRequestOTP();
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/login`, {
        user_id: formData.user_id,
        password: formData.password,
        otp: formData.otp,
      });
      const { message, data } = response.data;
      const { token, role } = data;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", role);
        if (formData.remember) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        toast.success(message || "Login successful!");
        setTimeout(() => navigate("/user/dashboard", { replace: true }), 1000);
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid user ID, password, or OTP.";
      if (errorMessage === "Email not verified") {
        navigate("/user/verify-user", { replace: true });
        toast.info("Please verify your account before proceeding.");
      } else if (errorMessage === "Invalid OTP" || errorMessage === "OTP expired") {
        setErrors((prev) => ({ ...prev, otp: errorMessage }));
        toast.error(errorMessage);
      } else if (errorMessage === "Invalid credentials") {
        setErrors((prev) => ({
          ...prev,
          user_id: errorMessage,
          password: errorMessage,
        }));
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
     <div className="hidden md:block w-full md:w-1/2 bg-black relative">
        <img src={loginimg} alt="Login" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 flex flex-col justify-between p-6">
          <Link
            to="/"
            className="self-end text-sm text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
            aria-label="Back to website"
          >
            Back to website →
          </Link>
          <div>
            <p className="text-xl font-medium">Capturing Moments,</p>
            <p className="text-xl font-medium">Creating Memories</p>
            <div className="mt-3 flex space-x-1">
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full relative min-h-screen md:min-h-auto flex items-center justify-center md:w-1/2 p-4 md:p-6 bg-black">
        <Link
          to="/"
          className="absolute top-5 right-5 text-xs text-white bg-white/10 hover:bg-white/20 px-4 py-1 rounded-full transition-colors backdrop-blur-md"
          aria-label="Back to website"
        >
          Back to website →
        </Link>
        <div className="w-full max-w-xl bg-[#111111] rounded-2xl p-4 md:p-8 border border-[#2a2a2a] shadow-lg">
          <div className="mb-5">
            <img src={logo} className="w-40" alt="Logo" />
          </div>
          <h2 className=" text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-white">Sign in to your account</h2>
          <p className="text-sm text-[#aaaaaa] mb-6">
            Enter your credentials to receive an OTP for verification.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-[14px] mb-1 text-[#aaa]">User ID</label>
              <input
                type="text"
                name="user_id"
                placeholder="Enter your user ID"
                autoComplete="username"
                value={formData.user_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white placeholder-[#555] border ${errors.user_id ? "border-red-500" : "border-[#2a2a2a]"
                  } focus:outline-none focus:ring-2 ${errors.user_id ? "focus:ring-red-500" : "focus:ring-[#FF6000]"
                  }`}
                disabled={isLoading}
                autoFocus
                aria-label="User ID input"
              />
              {errors.user_id && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {errors.user_id}
                </p>
              )}
            </div>
            <div className="relative">
              <label className="block text-[14px] mb-1 text-[#aaa]">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white placeholder-[#555] border ${errors.password ? "border-red-500" : "border-[#2a2a2a]"
                  } focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-[#FF6000]"
                  }`}
                disabled={isLoading}
                aria-label="Password input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className={`absolute right-3 bottom-3 text-[#888] text-lg hover:text-white transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            {otpRequested && (
              <div>
                <label className="block text-[14px] mb-1 text-[#aaa]">OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-white placeholder-[#555] rounded-md bg-[#1e1e1e] border ${
                    errors.otp ? "border-red-500" : "border-[#2a2a2a]"
                  } focus:outline-none focus:ring-2 ${
                    errors.otp ? "focus:ring-red-500" : "focus:ring-[#FF6000]"
                  }`}
                  disabled={isLoading}
                  aria-label="OTP input"
                />
                {errors.otp && (
                  <p className="text-red-400 text-sm mt-1" role="alert">
                    {errors.otp}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-[#aaaaaa]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="accent-[#FF6000]"
                  disabled={isLoading}
                  aria-label="Remember me checkbox"
                />
                Remember me
              </label>
              <Link
                to="/user/forgot-password"
                className="text-[#FF6000] hover:underline"
                aria-label="Forgot password link"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-md text-white font-semibold hover:opacity-90 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ background: 'linear-gradient(90deg, #FF6000 0%, #E3090D 100%)' }}
              disabled={isLoading}
              aria-label="Login button"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-[#2a2a2a]" />
            <span className="text-[#888] text-sm">
              Want to create an account?{" "}
              <Link
                to="/user/signup"
                className="text-[#FF6000] text-nowrap underline-offset-4 hover:underline"
                aria-label="Sign up link"
              >
                Sign Up
              </Link>
            </span>
            <hr className="flex-1 border-[#2a2a2a]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;