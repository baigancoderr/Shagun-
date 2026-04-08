import { useState, useEffect, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { LuBed, LuBath } from "react-icons/lu";
import { CgArrowsExpandRight } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { CiCalendarDate } from "react-icons/ci";
import { FaRegCircleCheck } from "react-icons/fa6";
import { LuClock } from "react-icons/lu";
import { FaRegCircle } from "react-icons/fa";
import { TrendingUp, CheckCircle } from "lucide-react";
import { MdExitToApp } from "react-icons/md";
import { LuBuilding2 } from "react-icons/lu";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { BsPersonFillCheck } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";

import { useQuery } from "@tanstack/react-query";
import { appConfig } from "../../../../config/appConfig.js";
import { toast } from "react-toastify";
import axios from "axios";

const TABS = [
  "Overview",
  "Construction Milestones",
  "Investment Calculator",
  "Documents",
];

const BENEFIT_ICON_MAP = {
  income: TrendingUp,
  exit: CheckCircle,
  conversion: LuBuilding2,
};

export default function UnderConstructionLeft({ property }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const images = property?.images || [];
  const totalImages = images.length;

  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Overview");

  const calculatorRef = useRef(null);
  const [selectedSlots, setSelectedSlots] = useState(0);

  // Add these lines (safe fallbacks)
  const totalSlots = property?.totalSlots || 1200;
  const availableSlots = property?.availableSlots || 847; // example fallback
  const filledPercentage =
    totalSlots > 0
      ? Math.min(
        100,
        Math.max(0, ((totalSlots - availableSlots) / totalSlots) * 100),
      )
      : 0;

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

  const MIN_INVEST = property?.minInvestment || 0;
  const walletBalance = dashboardData?.wallets?.depositWallet
    ? Number(
      dashboardData.wallets.depositWallet.replace("$", "").replace(/,/g, ""),
    )
    : 0;

  const [totalValue, setTotalValue] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [showDropdown, setShowDropdown] = useState(false);
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
    if (location.state?.tab === "calculator") {
      setActiveTab("Investment Calculator");
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === "Investment Calculator") {
      setTimeout(() => {
        financialRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [activeTab]);

  useEffect(() => {
    if (totalImages <= 4) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 >= totalImages ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [totalImages]);

  const overview = property.tabs.overview;
  const milestones = property.tabs.milestones;
  const calculator = property.tabs.calculator;
  const documents = property.tabs.documents;

  const completedCount = milestones.filter(
    (m) => m.status === "Completed",
  ).length;

  const totalCount = milestones.length;

  const overallProgress = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / totalCount,
  );

  const [amount, setAmount] = useState(() => {
    const saved = localStorage.getItem("investment_amount");
    return saved ? Number(saved) : 10000;
  });

  useEffect(() => {
    localStorage.setItem("investment_amount", amount);
  }, [amount]);

  const monthlyRate = 2.5; // later backend se aayega
  const monthlyReturn = Math.round((amount * monthlyRate) / 100);
  const yearlyReturn = monthlyReturn * 12;

  const visibleImages = [];

  for (let i = 0; i < Math.min(4, totalImages); i++) {
    visibleImages.push(images[(activeIndex + i) % totalImages]);
  }

  const [isBuying, setIsBuying] = useState(false);

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
        investment_type: "UNDERCONSTRUCTION",  // Adjust based on property type
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
    <div className="space-y-6">
      {/* BACK */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-[#4A5565] cursor-pointer hover:text-[#101828]"
      >
        <FaArrowLeft />
        Back to Under Construction Projects
      </div>

      {/* IMAGE GALLERY */}
      <div
        className="
    flex flex-col sm:flex-row
    gap-4
    bg-white rounded-xl p-4
  "
      >
        {/* ================= THUMBNAILS ================= */}
        <div
          className="
      flex flex-row sm:flex-col
      gap-3
      order-2 sm:order-1
      overflow-x-auto sm:overflow-visible
      scrollbar-hide
      justify-center sm:justify-start
    "
        >


          {visibleImages.map((img, index) => {
            const realIndex = (activeIndex + index) % totalImages;

            return (
              <button
                key={realIndex}
                onClick={() => setActiveIndex(realIndex)}
                className={`w-20 h-16 sm:w-24 sm:h-20
      shrink-0 rounded-xl overflow-hidden
      border-2 transition
      ${index === 0 ? "border-[#F97316]" : "border-transparent"}`}
              >
                <img
                  src={img}
                  alt="thumbnail"
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </button>
            );
          })}
        </div>

        {/* ================= FEATURE IMAGE ================= */}
        <div
          className="
      relative
      rounded-2xl overflow-hidden
      flex-1
      order-1 sm:order-2
    "
        >
          <img
            src={images[activeIndex]}
            className="
        w-full
        h-[240px] sm:h-[356px]
        object-cover
        transition-all duration-300
      "
          />

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-[#F7530B] text-white text-xs px-3 py-1 rounded-full">
              {property.risklevel}
            </span>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div>
        <h2 className="text-3xl font-semibold text-[#000000]">
          {property.title}
        </h2>

        <p className="flex items-center font-medium gap-2 text-lg text-[#000000E5] mt-1">
          <IoLocationOutline />
          {property.location}
        </p>

        <p className="flex items-center gap-2 text-sm font-medium text-[#000000CC] mt-1">
          <CiCalendarDate className="text-base" />
          Expected Completion Date: {property.expectedCompletion}
        </p>
      </div>

      <div className="bg-[#FFFFFF] border p-2 sm:p-4 border-[#E5E7EB] rounded-xl">
        {/* TABS */}
        <div className="border-b border-[#E5E7EB]">
          <div className="flex flex-wrap gap-6 text-sm justify-between sm:justify-start">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium text-left
          w-[45%] sm:w-auto
          ${activeTab === tab
                    ? "border-b-2 border-[#F97316] text-[#F97316]"
                    : "text-[#6A7282]"
                  }
        `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ================= OVERVIEW ================= */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {/* ABOUT */}
            <div>
              <h3 className="font-semibold text-[#101828] my-4">
                About This Project
              </h3>
              <p className="text-md font-medium text-[#4A5565] leading-relaxed">
                {overview.about}
              </p>
            </div>

            {/* DETAILS */}
            <div>
              <h3 className="font-semibold text-xl text-[#101828] mb-4">
                Property Details
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <Detail
                  icon={<LuBed />}
                  label="Bedrooms"
                  value={overview.details.beds}
                />
                <Detail
                  icon={<LuBath />}
                  label="Bathrooms"
                  value={overview.details.baths}
                />
                <Detail
                  icon={<CgArrowsExpandRight />}
                  label="Area (sqft)"
                  value={overview.details.area}
                />
              </div>
            </div>

            {/* PROJECT TEAM */}
            <div>
              <h3 className="text-lg font-semibold text-[#101828] mb-4">
                Project Team
              </h3>

              <div className="space-y-2">
                {overview.team.map((t, i) => {
                  const Icon = t.icon;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-6 py-4 bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE]"
                    >
                      <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center  bg-[#155DFC]">
                        <BsPersonFillCheck size={32} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#4A5565]">
                          {t.role}
                        </p>
                        <p className="text-lg font-semibold text-[#101828]">
                          {t.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AMENITIES */}
            <div>
              <h3 className="font-semibold text-lg text-[#101828] mb-4">
                Planned Amenities
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {overview.amenities.map((a, i) => (
                  <div
                    key={i}
                    className="bg-[#F4F9FF] text-[#364153] font-medium text-md rounded-lg px-6 py-3 flex gap-4"
                  >
                    <span>
                      <FaRegCircleCheck className="text-xl text-[#00A63E]" />
                    </span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Construction Milestones" && (
          <div className="space-y-6">
            {/* ================= OVERALL PROGRESS ================= */}
            <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FFFBEB] border border-[#FFEDD4] rounded-xl p-4 mt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xl font-semibold text-[#101828] mb-2">
                    Overall Progress
                  </p>
                  <p className="text-md text-[#4A5565]">
                    {completedCount} of {totalCount} milestones completed
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-[#F54900]">
                    {overallProgress}%
                  </p>
                  <p className="text-sm text-[#4A5565]">Complete</p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-4 bg-[#E5E7EB] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#F97316]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-[#4A5565]">
                <span>Started: {property.Started}</span>
                <span>{property.structure}</span>
                <span>Target: {property.expectedCompletion}</span>
              </div>
            </div>

            {/* ================= TIMELINE ================= */}
            <p className="text-xl font-semibold text-[#101828]">
              Construction Timeline
            </p>

            <div className="space-y-4">
              {milestones.map((m, i) => {
                const completed = m.status === "Completed";
                const progress = m.status === "In Progress";

                return (
                  <div
                    key={i}
                    className={`border rounded-xl px-4 py-5 ${completed
                        ? "bg-[#F0FDF4] border-[#B9F8CF]"
                        : progress
                          ? "bg-[#FFF7ED] border-[#FFD6A7]"
                          : "bg-[#F9FAFB] border-[#E5E7EB]"
                      }`}
                  >
                    {/* TOP */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${completed
                              ? "bg-green-500 text-white"
                              : progress
                                ? "bg-orange-500 text-white"
                                : "bg-gray-300 text-white"
                            }`}
                        >
                          {completed ? (
                            <FaRegCircleCheck className="text-sm" />
                          ) : progress ? (
                            <LuClock className="text-sm" />
                          ) : (
                            <FaRegCircle className="text-sm" />
                          )}
                        </div>

                        <div>
                          <p className="text-lg font-semibold text-[#101828]">
                            {m.label}
                          </p>
                          <p className="text-sm text-[#4A5565]">{m.desc}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${completed
                              ? "text-[#00A63E]"
                              : progress
                                ? "text-[#F54900]"
                                : "text-[#6A7282]"
                            }`}
                        >
                          {m.status}
                        </p>
                        <p className="text-xs text-[#6A7282]">
                          Target: {m.target}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-2">
                      <p className="text-xs text-[#4A5565] mt-2 justify-between flex mb-3">
                        <span>Progress </span>
                        <span>{m.progress}%</span>
                      </p>

                      <div className="h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full ${completed
                              ? "bg-[#00A63E]"
                              : progress
                                ? "bg-[#F54900]"
                                : "bg-[#6A7282]"
                            }`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= CALCULATOR ================= */}

        {activeTab === "Investment Calculator" && (
          <div className="space-y-10 pt-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Investment Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                <p className="text-sm text-blue-700 font-medium uppercase tracking-wide mb-1">
                  Total Area
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {property?.propertyTotalArea || "—"}
                </p>
                <p className="text-sm text-gray-600 mt-2">sqft</p>
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
                  Value Growth
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {property?.financials?.metrics?.valueGrowth ?? "—"}%
                </p>
                <p className="text-sm text-gray-600 mt-2">Expected annually</p>
              </div>
            </div>

            {/* PROPERTY SCORE BREAKDOWN */}
            {property?.financials?.breakdown?.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Property Score Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gradient-to-br from-[#EEF2FF] to-[#F5FAFF] p-5 rounded-xl">
                  {property.financials.breakdown.map((item, index) => {
                    const percent =
                      item.max > 0 ? (item.value / item.max) * 100 : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>{item.label}</span>
                          <span>
                            {item.value} / {item.max}
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percent}%`,
                              background:
                                "linear-gradient(90deg, #F54900 0%, #FF9D59 100%)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INVESTMENT SLOTS SECTION */}


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

        {/* ================= DOCUMENTS ================= */}
        {activeTab === "Documents" && (
          <div className="p-4 space-y-4">
            <p className="text-md font-medium text-[#4A5565]">
              Access all important documents related to this construction
              project including permits, blueprints, and legal documentation.
            </p>

            {property.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF6900] to-[#E17100] flex items-center justify-center">
                    <IoDocumentText className="text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#101828]">
                      {doc.name}
                    </p>
                    <p className="text-xs text-[#6A7282]">{doc.type}</p>
                  </div>
                </div>

                {/* VIEW BUTTON */}
                <a
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                          inline-flex items-center gap-2
                          text-sm px-3 py-1.5
                          rounded-lg
                          bg-[#F3F4F6]
                          text-[#364153] font-medium
                          hover:bg-[#EEF4FF]
                          transition
                        "
                >
                  <span>View</span>
                  <FaArrowUpRightFromSquare className="text-xs" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Detail = ({ icon, label, value }) => (
  <div className="bg-[#F2F9FF] rounded-xl p-4 text-start">
    <div className="flex justify-left gap-2 text-xl mb-2 text-[#4A5565]">
      {icon}
      <p className="text-sm text-[#4A5565]">{label}</p>
    </div>
    <p className="font-semibold text-2xl text-[#101828]">{value}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between pb-4">
    <span className="text-[#6A7282]">{label}</span>
    <span className="font-semibold text-[#101828]">{value}</span>
  </div>
);