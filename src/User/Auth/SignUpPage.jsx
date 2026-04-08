import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";
import loginimg from "../../assets/userImages/images/signup.jpeg";
// import logo from "../../assets/userImages/Logo/logo_lght1.png";


import logo from "../../assets/userImages/Logo/logo_lght1.png";
import countries from "../../Common/contry.json";
import { FaChevronDown } from "react-icons/fa";


const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    referral: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    reenterpassword: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);

  useEffect(() => {
    const referralFromUrl = searchParams.get("referral");
    if (referralFromUrl) {
      setFormData((prev) => ({ ...prev, referral: referralFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  // outside click close
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.phone.trim()) newErrors.phone = "Mobile number is required";

    if (!formData.country.trim()) newErrors.country = "Country is required";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    if (!formData.reenterpassword.trim())
      newErrors.reenterpassword = "Please re-enter your password";
    else if (formData.reenterpassword !== formData.password)
      newErrors.reenterpassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = {
      sponsor_id:
        formData.referral.trim() || appConfig.defaultReferral || "URWA00001",
      first_name: formData.firstName,
      last_name: formData.lastName,
      country: formData.country,
      email: formData.email,
      mobile_number: formData.phone,
      password: formData.password,
      repeat_password: formData.reenterpassword,
    };

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${appConfig.baseURL}/user/auth/signup`,
        data
      );
      const result = response.data;

      toast.success(
        result.message ||
        "Signup successful! Redirecting to OTP verification..."
      );

      // Navigate to OTP page with email, user_id and type
      setTimeout(() => {
        navigate("/user/verify-user", {
          state: {
            email: formData.email,
            user_id: result.user_id,
            type: "signup",
          },
          replace: true,
        });
      }, 1200);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to sign up";
      toast.error(errorMessage);
      setErrors((prev) => ({
        ...prev,
        email: errorMessage.includes("email") ? errorMessage : prev.email,
        password: errorMessage.includes("password")
          ? errorMessage
          : prev.password,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
      {/* <div className="w-full h-screen md:w-1/2 bg-[#1a152d] relative"> */}
      <div className="hidden md:block h-screen md:w-1/2 bg-[#1a152d] relative">
        <img
          src={loginimg}
          alt="Join Community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 flex flex-col justify-between p-6">
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

      <div className="w-full relative h-full overflow-y-auto flex justify-center md:w-1/2 p-8 md:p-12 bg-black">
        <Link
          to="/"
          className="absolute top-5 right-5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full transition-colors"
          aria-label="Back to website"
        >
          Back to website →
        </Link>

        <div className="w-full max-w-xl ">
          <div className="mb-5">
            <img src={logo} className="w-40" alt="Logo" />
          </div>
          <h2 className="text-xl md:text-3xl font-bold mb-4 text-white">
            Create your account
          </h2>
          <p className="text-sm text-[#aaaaaa] mb-6">
            Join us and get started on your journey. Fill in the details below
            to sign up.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Referral Code */}
          <div>
  <input
    type="text"
    name="referral"
    value={formData.referral}
    onChange={handleChange}
    placeholder="Sponser ID"
    className="w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white placeholder-[#555] border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
    disabled={isLoading}
    aria-label="Referral code input"
  />
</div>

            {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      placeholder="First Name"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.firstName ? "border-red-500" : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.firstName
          ? "focus:ring-red-500"
          : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="First name input"
    />
    {errors.firstName && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.firstName}
      </p>
    )}
  </div>
  <div>
    <input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      placeholder="Last Name"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.lastName ? "border-red-500" : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.lastName
          ? "focus:ring-red-500"
          : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="Last name input"
    />
    {errors.lastName && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.lastName}
      </p>
    )}
  </div>
</div>

            {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Email"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.email ? "border-red-500" : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="Email input"
    />
    {errors.email && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.email}
      </p>
    )}
  </div>
  <div>
    <input
      type="tel"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      placeholder="Mobile Number"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.phone ? "border-red-500" : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.phone ? "focus:ring-red-500" : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="Phone number input"
    />
    {errors.phone && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.phone}
      </p>
    )}
  </div>
</div>

            {/* Country */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div ref={countryRef} className="relative">
             
                <div
                  tabIndex={0}
                  onClick={() => !isLoading && setCountryOpen(true)}
                  className={`w-full px-4 py-3 rounded-md bg-gray-50 text-gray-800 border cursor-text
                    flex items-center justify-between
                    ${errors.country ? "border-red-500" : "border-gray-300"}
                    focus:outline-none focus:ring-2
                    ${errors.country ? "focus:ring-red-500" : "focus:ring-blue-700"}
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="text-gray-800">
                    {formData.country || "Select Country"}
                  </span>
                  <FaChevronDown className="text-gray-800 text-xs" />
                </div>

              
                {countryOpen && !isLoading && (
                  <div
                    className="absolute z-50 mt-1 w-full bg-gray-50 border border-gray-300
                 rounded-md shadow-sm"
                  >
                   
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Type country name..."
                      className="w-full px-4 py-2 border-b border-gray-300
                   focus:outline-none text-gray-800 bg-gray-50"
                      autoFocus
                    />

               
                    <div className="max-h-[180px] overflow-y-auto">
                      {countries
                        .filter((c) =>
                          c.name.toLowerCase().includes(countrySearch.toLowerCase())
                        )
                        .map((country, index) => {
                          const isSelected = formData.country === country.name;

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  country: country.name,
                                }));
                                setErrors((prev) => ({ ...prev, country: "" }));
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                              className={`px-4 py-3 cursor-pointer
                  ${isSelected
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-800 hover:bg-gray-100"}
                `}
                            >
                              {country.name}
                            </div>
                          );
                        })}

                      
                      {countries.filter((c) =>
                        c.name.toLowerCase().includes(countrySearch.toLowerCase())
                      ).length === 0 && (
                          <div className="px-4 py-3 text-gray-500 text-sm">
                            No country found
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {errors.country && (
                  <p className="text-red-500 text-xs mt-1" role="alert">
                    {errors.country}
                  </p>
                )}
              </div>
            </div> */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div ref={countryRef} className="relative">
    <div
      tabIndex={0}
      onClick={() => !isLoading && setCountryOpen(true)}
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border cursor-text
        flex items-center justify-between
        ${errors.country ? "border-red-500" : "border-[#2a2a2a]"}
        focus:outline-none focus:ring-2
        ${errors.country ? "focus:ring-red-500" : "focus:ring-[#FF6000]"}
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="text-white">
        {formData.country || "Select Country"}
      </span>
      <FaChevronDown className="text-white text-xs" />
    </div>

    {countryOpen && !isLoading && (
      <div
        className="absolute z-50 mt-1 w-full bg-[#1e1e1e] border border-[#2a2a2a]
        rounded-md shadow-sm"
      >
        <input
          type="text"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          placeholder="Type country name..."
          className="w-full px-4 py-2 border-b border-[#2a2a2a]
          focus:outline-none text-white placeholder-[#555] bg-[#1e1e1e]"
          autoFocus
        />

        <div className="max-h-[180px] overflow-y-auto">
          {countries
            .filter((c) =>
              c.name.toLowerCase().includes(countrySearch.toLowerCase())
            )
            .map((country, index) => {
              const isSelected = formData.country === country.name;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      country: country.name,
                    }));
                    setErrors((prev) => ({ ...prev, country: "" }));
                    setCountryOpen(false);
                    setCountrySearch("");
                  }}
                  className={`px-4 py-3 cursor-pointer
                    ${isSelected
                      ? "bg-[#FF6000] text-white"
                      : "text-white hover:bg-[#2a2a2a]"}
                  `}
                >
                  {country.name}
                </div>
              );
            })}

          {countries.filter((c) =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase())
          ).length === 0 && (
            <div className="px-4 py-3 text-[#777] text-sm">
              No country found
            </div>
          )}
        </div>
      </div>
    )}

    {errors.country && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.country}
      </p>
    )}
  </div>
</div>





            {/* Password & Confirm Password */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full px-4 py-3 rounded-md bg-gray-50 text-gray-800 border ${errors.password ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 ${errors.password
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-700"
                    }`}
                  disabled={isLoading}
                  aria-label="Password input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className={`absolute right-3 top-4 text-gray-600 text-lg hover:text-gray-800 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  type={showReenterPassword ? "text" : "password"}
                  name="reenterpassword"
                  value={formData.reenterpassword}
                  onChange={handleChange}
                  placeholder="Repeat Password"
                  className={`w-full px-4 py-3 rounded-md bg-gray-50 text-gray-800 border ${errors.reenterpassword
                    ? "border-red-500"
                    : "border-gray-300"
                    } focus:outline-none focus:ring-2 ${errors.reenterpassword
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-700"
                    }`}
                  disabled={isLoading}
                  aria-label="Confirm password input"
                />
                <button
                  type="button"
                  onClick={() => setShowReenterPassword((prev) => !prev)}
                  disabled={isLoading}
                  className={`absolute right-3 top-4 text-gray-600 text-lg hover:text-gray-800 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  aria-label={
                    showReenterPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showReenterPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.reenterpassword && (
                  <p className="text-red-500 text-xs mt-1" role="alert">
                    {errors.reenterpassword}
                  </p>
                )}
              </div>
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Password"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.password ? "border-red-500" : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.password
          ? "focus:ring-red-500"
          : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="Password input"
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      disabled={isLoading}
      className={`absolute right-3 top-4 text-[#777] text-lg hover:text-white transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
    {errors.password && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.password}
      </p>
    )}
  </div>
  <div className="relative">
    <input
      type={showReenterPassword ? "text" : "password"}
      name="reenterpassword"
      value={formData.reenterpassword}
      onChange={handleChange}
      placeholder="Repeat Password"
      className={`w-full px-4 py-3 rounded-md bg-[#1e1e1e] text-white border ${errors.reenterpassword
        ? "border-red-500"
        : "border-[#2a2a2a]"
        } placeholder-[#555] focus:outline-none focus:ring-2 ${errors.reenterpassword
          ? "focus:ring-red-500"
          : "focus:ring-[#FF6000]"
        }`}
      disabled={isLoading}
      aria-label="Confirm password input"
    />
    <button
      type="button"
      onClick={() => setShowReenterPassword((prev) => !prev)}
      disabled={isLoading}
      className={`absolute right-3 top-4 text-[#777] text-lg hover:text-white transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      aria-label={
        showReenterPassword
          ? "Hide confirm password"
          : "Show confirm password"
      }
    >
      {showReenterPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
    {errors.reenterpassword && (
      <p className="text-red-500 text-xs mt-1" role="alert">
        {errors.reenterpassword}
      </p>
    )}
  </div>
</div>

{/* Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-md bg-gradient-to-br from-[#FF6000] to-[#E3090D] text-white hover:opacity-90 transition-colors font-semibold ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={isLoading}
              aria-label="Sign up button"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>


          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-300" />
            <span className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/user/login"
                className="text-[#FF6000] underline-offset-4 hover:underline text-nowrap"
                aria-label="Sign in link"
              >
                Sign In
              </Link>
            </span>
            <hr className="flex-1 border-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;