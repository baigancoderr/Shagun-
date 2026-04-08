import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { appConfig } from "../../../../config/appConfig.js";
import axios from "axios";

import {
  FaHeart,
  FaShareAlt,
  FaBed,
  FaBath,
  FaExpandArrowsAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { GrDocumentText } from "react-icons/gr";
import { HiDownload } from "react-icons/hi";
import { CiShoppingCart } from "react-icons/ci";

const STAT_CONFIG = [
  { key: "beds", label: "Bedrooms", icon: <FaBed />, color: "text-blue-600" },
  {
    key: "baths",
    label: "Bathrooms",
    icon: <FaBath />,
    color: "text-purple-600",
  },
  {
    key: "propertyTotalArea",
    label: "Total Area (SQFT)",
    icon: <FaExpandArrowsAlt />,
    color: "text-green-600",
  },
  {
    key: "listed",
    label: "Listed",
    icon: <FaCalendarAlt />,
    color: "text-orange-600",
  },
];

export default function ReadymadeLeft({ property, activeTab, setActiveTab }) {
  // const [activeTab, setActiveTab] = useState("About Property");
  const financialRef = useRef(null);
  const sliderRef = useRef(null);
  // const [activeImage, setActiveImage] = useState(property?.image || "");
  const [selectedSlots, setSelectedSlots] = useState(0); // user selected slots
  const [animating, setAnimating] = useState(false);
 const [isBuying, setIsBuying] = useState(false);
  const mobileGalleryRef = useRef(null);

  if (!property) {
    return (
      <div className="bg-white rounded-2xl border p-6 text-center text-gray-500">
        Property details are loading...
      </div>
    );
  }

  const images =
    Array.isArray(property?.gallery) && property.gallery.length > 0
      ? property.gallery
      : property?.image
        ? [property.image]
        : [];

  const totalImages = images.length;

  const [activeIndex, setActiveIndex] = useState(0);

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardData"], // same key as Dashboard page
    queryFn: async () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${appConfig.baseURL}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // const MIN_INVEST = 5;
  const MIN_INVEST = property?.minInvestment ?? 0;
  // const walletBalance = property?.walletBalance || 500;
  const walletBalance = dashboardData?.wallets?.depositWallet
    ? Number(
        dashboardData.wallets.depositWallet.replace("$", "").replace(/,/g, ""),
      )
    : 0;

  const [sqftQuantity, setSqftQuantity] = useState(0);

  const propertyPricePerSqft = property?.property_per_sqft_price_usd || 0;

  const maxSqft =
    propertyPricePerSqft > 0 && walletBalance > 0
      ? walletBalance / propertyPricePerSqft
      : 0;

  const maxSqftDisplay = maxSqft.toFixed(8); // image jaisa long decimal

  const currentPercent =
    maxSqft > 0
      ? Math.min(100, Math.max(0, (sqftQuantity / maxSqft) * 100))
      : 0;

  const numericAmount = sqftQuantity * propertyPricePerSqft;

  const rentalYieldPercent = property?.rental_percentage ?? 0;
  const monthlyRentalAmount = (numericAmount * rentalYieldPercent) / 100;

  // Auto clamp
  // Auto clamp (sirf max tak, 0 allowed)
  useEffect(() => {
    if (maxSqft > 0 && sqftQuantity > maxSqft) {
      setSqftQuantity(maxSqft);
    }
  }, [maxSqft]);

  const handleSliderUpdate = (clientX) => {
    if (!sliderRef.current || maxSqft <= 0) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let newPercent = ((clientX - rect.left) / rect.width) * 100;
    newPercent = Math.max(0, Math.min(100, newPercent));

    const calculatedSqft = (newPercent / 100) * maxSqft;
    const newSqft = Math.max(0, Math.min(maxSqft, calculatedSqft));

    setSqftQuantity(newSqft);
  };

  const handleMouseDown = (e) => {
    handleSliderUpdate(e.clientX);

    const onMouseMove = (moveE) => handleSliderUpdate(moveE.clientX);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const handleTouchStart = (e) => {
    if (e.touches.length === 0 || maxSqft <= 0) return;
    handleSliderUpdate(e.touches[0].clientX);

    const onTouchMove = (moveE) => {
      if (moveE.touches.length > 0)
        handleSliderUpdate(moveE.touches[0].clientX);
    };
    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  };

  useEffect(() => {
    if (!totalImages || totalImages <= 4) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 >= totalImages ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [totalImages]);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Calculate filled slots
  const totalSlots = property.totalSlots || 100;
  const availableTokens = property.availableTokens || 0;
  const availableSlots = Math.floor(
    availableTokens / (property.tokensPerSlot || 100),
  );
  const filledPercentage =
    totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0;

  const visibleImages = [];

  if (totalImages > 0) {
    for (let i = 0; i < Math.min(4, totalImages); i++) {
      visibleImages.push(images[(activeIndex + i) % totalImages]);
    }
  }

  const handleBuy = async () => {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (!token) {
      toast.warning("Please login to continue and buy Properties");
      return;
    }

    if (numericAmount < MIN_INVEST) {
      toast.warning("Minimum investment required");
      return;
    }

    if (numericAmount > walletBalance) {
      toast.warning("Insufficient balance");
      return;
    }

    try {
      setIsBuying(true);

      const payload = {
        propertyId: property.backendId,
        amount_usd: numericAmount,
        investment_type: "READY",  // Adjust based on property type
      };

      await axios.post(`${appConfig.baseURL}/user/properties/invest`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Property purchased successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to complete the purchase. Please try again later."
      );
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-3 md:p-6 space-y-6 shadow-sm">
      {/* ===================== GALLERY ===================== */}
      <div className="grid grid-cols-12 gap-4">
        <div className="hidden md:block col-span-2 space-y-4">
          {visibleImages.map((img, index) => {
            const realIndex = (activeIndex + index) % totalImages;

            return (
              <img
                key={realIndex}
                src={img}
                alt={`Thumbnail ${realIndex + 1}`}
                onClick={() => setActiveIndex(realIndex)}
                className={`w-full h-[82px] object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 hover:scale-105 ${
                  index === 0
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              />
            );
          })}
        </div>

        <div className="col-span-12 md:col-span-10 relative overflow-hidden rounded-2xl shadow-lg">
          <img
            key={activeIndex}
            src={images[activeIndex] || property.image}
            alt={property.title}
            className={`w-full h-[260px] md:h-[420px] object-cover rounded-2xl transition-all duration-700 ease-in-out ${
              animating ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow">
              {property.risk}
            </span>
            <div className="flex gap-2">
              <button className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow hover:bg-white">
                <FaHeart className="text-lg" />
              </button>
              <button className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow hover:bg-white">
                <FaShareAlt className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile thumbnails */}
      <div className="md:hidden overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 pb-2" ref={mobileGalleryRef}>
          {visibleImages.map((img, index) => {
            const realIndex = (activeIndex + index) % totalImages;

            return (
              <img
                key={realIndex}
                src={img}
                alt={`Mobile ${realIndex + 1}`}
                onClick={() => setActiveIndex(realIndex)}
                className={`flex-shrink-0 w-[110px] h-[85px] object-cover rounded-lg cursor-pointer border-2 ${
                  index === 0 ? "border-blue-500 shadow-md" : "border-gray-200"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ===================== TITLE & LOCATION ===================== */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {property.title || "Property Title"}
        </h1>
        <p className="flex items-center gap-2 text-gray-600 text-base md:text-lg">
          <MdLocationOn className="text-red-500" />
          {property.location || "Location not available"}
        </p>
      </div>

      {/* ===================== STATS ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CONFIG.map((item) => (
          <div
            key={item.key}
            className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${item.color} bg-opacity-10`}
            >
              <span className="text-3xl">{item.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {property.stats?.[item.key] ?? property[item.key] ?? "—"}
            </p>
            <p className="text-sm text-gray-600 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ===================== TABS ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
        {["About Property", "Financial Details", "Documents", "Location"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-center font-medium rounded-xl transition-all duration-300 border
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* ===================== ABOUT PROPERTY ===================== */}
      {activeTab === "About Property" && (
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description ||
                "No description available for this property."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Amenities & Features
            </h2>
            {property.amenities?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold">
                      ✓
                    </span>
                    <span className="text-gray-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No amenities listed for this property.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===================== FINANCIAL DETAILS WITH SLOTS ===================== */}
      {activeTab === "Financial Details" && (
        <div ref={financialRef} className="space-y-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Investment Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-700 font-medium uppercase tracking-wide mb-1">
                Available Area
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {property?.property_totalAvailableArea ?? "—"}
              </p>
              <p className="text-sm text-gray-600 mt-2">SQFT</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-green-700 font-medium uppercase tracking-wide mb-1">
                Rental Income
              </p>
              <p className="text-3xl font-bold text-green-700">
                {property?.rental_percentage ?? "—"}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Of investment</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-purple-700 font-medium uppercase tracking-wide mb-1">
                24H Volume
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {property?.financials?.metrics?.valueGrowth ?? "—"}
              </p>
              <p className="text-sm text-gray-600 mt-2">Expected annually</p>
            </div>
          </div>

          {/* ===================== PROPERTY SCORE BREAKDOWN ===================== */}
          {property?.financials?.breakdown?.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Property Score Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gradient-to-br p-3 rounded-md from-[#EEF2FF] to-[#F5FAFF]">
                {property.financials.breakdown.map((item, index) => {
                  const percent =
                    item.max > 0 ? (item.value / item.max) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-700 font-medium">
                        <span>{item.label}</span>
                        <span>
                          {item.value}/{item.max}
                        </span>
                      </div>

                      <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percent}%`,
                            background:
                              "linear-gradient(90deg, #6390FF 0%, #11006E 100%)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            <div className="
  mt-8 sm:mt-10 md:mt-12 
  bg-white 
  rounded-2xl sm:rounded-3xl 
  border border-gray-200 
  shadow-sm sm:shadow-md 
  p-5 sm:p-6 lg:p-8 
  space-y-6 sm:space-y-7 lg:space-y-8
">

              {/* Header */}
              <div className="pb-3 sm:pb-4 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Invest Now
                </h3>
              </div>

              {/* Price per SQFT */}
              <div className="
    flex flex-col sm:flex-row sm:items-center sm:justify-between 
    gap-2 sm:gap-4 
    bg-gray-50 border border-gray-200 sm:border-gray-300 
    rounded-xl px-5 py-4 sm:px-6 sm:py-5
  ">
                <span className="text-gray-700 sm:text-gray-800 text-base sm:text-lg font-medium">
                  Price per SQFT
                </span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600 text-left sm:text-right">
                  {property?.property_per_sqft_price_usd
                    ? `$${property.property_per_sqft_price_usd.toLocaleString()}`
                    : "N/A"}
                  <span className="text-base font-normal"> / SQFT</span>
                </span>
              </div>

              {/* Quantity input section */}
              <div className="
    bg-gray-50 border border-gray-200 
    rounded-xl sm:rounded-2xl 
    px-2 sm:px-4 py-5 space-y-4 sm:space-y-0
  ">
                <div className="text-gray-700 mb-4 text-base sm:text-lg font-medium">
                  SQFT Quantity
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setSqftQuantity(Math.max(0, sqftQuantity - 1))}
                    className="
          max-w-[44px] h-8 sm:h-12 w-8 sm:w-12 
          bg-white border border-gray-300 hover:border-gray-400 
          rounded-xl flex items-center justify-center 
          text-2xl sm:text-3xl font-light text-gray-700 
          active:scale-95 transition-transform
        "
                  >
                    −
                  </button>

                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={sqftQuantity}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (isNaN(val)) val = 0;
                      val = Math.max(0, Math.min(maxSqft, val));
                      setSqftQuantity(val);
                    }}
                    className="
          flex-1 max-w-[140px] max-w-[180px] sm:max-w-[140px] sm:w-32
          text-center text-lg sm:text-2xl font-semibold text-gray-900
          bg-white border border-gray-300 focus:border-blue-500
          rounded-xl py-2.5 px-3 focus:outline-none
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        "
                  />

                  <button
                    type="button"
                    onClick={() => setSqftQuantity(Math.min(maxSqft, sqftQuantity + 1))}
                    className="
          max-w-[44px] h-8 sm:h-12 w-8 sm:w-12 
          bg-white border border-gray-300 hover:border-gray-400 
          rounded-xl flex items-center justify-center 
          text-2xl sm:text-3xl font-light text-gray-700 
          active:scale-95 transition-transform
        "
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => setSqftQuantity(maxSqft)}
                    disabled={maxSqft <= 0}
                    className="
          px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold
          bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400
          text-white rounded-xl transition-colors active:scale-95
          flex-shrink-0
        "
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2 sm:space-y-3">
                <div
                  ref={sliderRef}
                  onClick={(e) => handleSliderUpdate(e.clientX)}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  className="
        relative h-4 bg-gray-200 sm:bg-gray-300 
        rounded-full cursor-pointer select-none touch-none
      "
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${currentPercent}%` }}
                  />
                  <div
                    className="
          absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-600 
          rounded-full shadow-md transform -translate-y-1/2 
          transition-all duration-300 pointer-events-none
        "
                    style={{ left: `calc(${currentPercent}% - 12px)` }}
                  />
                </div>

                <div className="flex justify-between text-xs sm:text-sm text-gray-500 sm:text-gray-600 mt-2 sm:mt-3 font-medium px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Summary cards */}
              <div className="
    bg-gray-50 border border-gray-200 
    rounded-xl p-4 sm:p-5 
    space-y-3 sm:space-y-4 text-sm sm:text-base
  ">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 sm:text-gray-800 font-medium">Available Balance</span>
                  <span className="font-semibold text-gray-900">
                    ${walletBalance?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 sm:text-gray-800 font-medium">Max Buy</span>
                  <span className="font-semibold text-gray-900">
                    {maxSqftDisplay} SQFT
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-700 sm:text-gray-800 font-medium">Invest Amount</span>
                  <span className="font-semibold text-gray-900">
                    ${Number(numericAmount.toFixed(2)).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 sm:text-gray-800 font-medium">Monthly Rental</span>
                  <span className="font-semibold text-green-700">
                    ${Number(monthlyRentalAmount.toFixed(2)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Buy button */}
              <button
                disabled={numericAmount < MIN_INVEST || isBuying}
                onClick={handleBuy}
                className={`
      w-full py-3.5 sm:py-4 
      rounded-xl sm:rounded-2xl 
      font-semibold text-base sm:text-lg 
      transition-all duration-300 shadow-sm
      ${numericAmount >= MIN_INVEST && !isBuying
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:bg-blue-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }
    `}
              >
                {isBuying ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : numericAmount >= MIN_INVEST ? (
                  `Buy Property ($${Number(numericAmount.toFixed(2)).toLocaleString()})`
                ) : (
                  `Min $${MIN_INVEST} Required`
                )}
              </button>

            </div>

          {/* <div className="mt-12 bg-white rounded-3xl border border-gray-200 shadow-md p-8 space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                Invest Now
              </h3>
            </div>

            <div className="flex justify-between items-center bg-gray-50 border border-gray-300 rounded-xl px-6 py-5">
              <span className="text-gray-800 text-lg font-medium">Price</span>
              <span className="text-2xl font-bold text-blue-600">
                ${" "}
                {property?.property_per_sqft_price_usd
                  ? `${property.property_per_sqft_price_usd.toLocaleString()}`
                  : "N/A"}{" "}
                / SQFT
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 flex justify-between items-center">
              <span className="text-gray-700 text-lg font-medium">
                SQFT Quantity
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSqftQuantity(Math.max(0, sqftQuantity - 1))}
                  className="w-11 h-11 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl flex items-center justify-center text-3xl font-light text-gray-700 transition-all active:scale-95"
                >
                  −
                </button>

                <input
                  type="number"
                  step="0.000001"
                  value={sqftQuantity}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 0;
                    val = Math.max(0, Math.min(maxSqft, val));
                    setSqftQuantity(val);
                  }}
                  className="w-32 bg-white text-center text-4xl font-semibold text-gray-900 border border-gray-300 focus:border-blue-500 rounded-2xl py-2 focus:outline-none"
                />

                <button
                  onClick={() => setSqftQuantity(Math.min(maxSqft, sqftQuantity + 1))}
                  className="w-11 h-11 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl flex items-center justify-center text-3xl font-light text-gray-700 transition-all active:scale-95"
                >
                  +
                </button>

                <button
                  onClick={() => setSqftQuantity(maxSqft)}
                  disabled={maxSqft <= 0}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-2xl transition-all"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <div
                ref={sliderRef}
                onClick={(e) => handleSliderUpdate(e.clientX)}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative h-4 bg-gray-300 rounded-full cursor-pointer select-none"
              >
                <div
                  className="absolute left-0 top-0 h-4 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${currentPercent}%` }}
                />
                <div
                  className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md transform -translate-y-1/2 transition-all duration-300 pointer-events-none"
                  style={{ left: `calc(${currentPercent}% - 12px)` }}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600 mt-3 font-medium">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-800 text-lg font-medium">
                  Available Balance
                </span>
                <span className="font-semibold text-gray-900 text-lg">
                  ${walletBalance?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-800 text-lg font-medium">
                  Max Buy
                </span>
                <span className="font-semibold text-gray-900 text-lg">
                  {maxSqftDisplay} SQFT
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-800 text-lg font-medium">
                  Invest Amount
                </span>
                <span className="font-semibold text-gray-900 text-lg">
                  ${Number(numericAmount.toFixed(2)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-800 text-lg font-medium">
                  Monthly Rental
                </span>
                <span className="font-semibold text-gray-900 text-lg">
                  ${Number(monthlyRentalAmount.toFixed(2)).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              disabled={numericAmount < MIN_INVEST || isBuying}
              onClick={handleBuy}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300
                ${
                  numericAmount >= MIN_INVEST
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isBuying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : numericAmount >= MIN_INVEST ? (
                `Buy Property ($${Number(numericAmount.toFixed(2)).toLocaleString()})`
              ) : (
                `Min $${MIN_INVEST} Required`
              )}
            </button>
          </div> */}
        </div>
      )}

      {/* ===================== DOCUMENTS & LOCATION TABS (same as before) ===================== */}
      {activeTab === "Documents" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Legal Documents
          </h2>
          {property.documents?.length > 0 ? (
            <div className="space-y-4">
              {property.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 rounded-xl p-4 border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <GrDocumentText className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc.link, doc.name)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <HiDownload /> Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No documents available.
            </p>
          )}
        </div>
      )}

      {activeTab === "Location" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Location</h2>
          <div className="w-full h-[400px] rounded-2xl overflow-hidden border shadow">
            <iframe
              title="Property Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(property.location || "Bhopal")}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}