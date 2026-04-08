import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoLocationOutline, IoTrendingUpOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa6";
import { CiHeart, CiShare2 } from "react-icons/ci";
import { FiShield } from "react-icons/fi";
import { FiLink } from "react-icons/fi";
import { LuBed } from "react-icons/lu";
import { LuBath } from "react-icons/lu";
import { CgArrowsExpandRight } from "react-icons/cg";
import { GoDotFill } from "react-icons/go";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { SlBasket } from "react-icons/sl";
import { IoAnalyticsOutline } from "react-icons/io5";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import axios from "axios";
import { appConfig } from "../../../../config/appConfig";
import { useQuery } from "@tanstack/react-query";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "buy", label: "Buy Properties" },
  // { key: "marketplace", label: "Token Marketplace" },
  { key: "documents", label: "Documents" },
];

export default function TokenizedLeft({ property }) {
  const location = useLocation();
  const buyTabRef = useRef(null);
  const [activeTab, setActiveTab] = useState(
    location.state?.tab || "overview"
  );

  useEffect(() => {
    if (location.state?.tab === "buy") {
      setActiveTab("buy");

      setTimeout(() => {
        buyTabRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  }, [location.state]);

  const [isBuying, setIsBuying] = useState(false);

  // USDT amount input
  const [amountUSDT, setAmountUSDT] = useState(0);

  const perSqftPrice = Number(property?.property_per_sqft_price_usd) || 0;
  const availableArea = Number(property?.property_totalAvailableArea) || 0;
  const availableTokens = Number(property?.available_tokens_supply) || 0;
  const tokenPrice = Number(property?.tokenPrice) || 0;

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardData"],
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

  const walletBalance = dashboardData?.wallets?.depositWallet
    ? Number(
        dashboardData.wallets.depositWallet.replace("$", "").replace(/,/g, "")
      )
    : 0;

  // Calculate Area based on USDT amount
  const sqftOwned = perSqftPrice > 0 ? amountUSDT / perSqftPrice : 0;
  const sqftOwnedDisplay = sqftOwned.toFixed(6);

  // ✅ Calculate Tokens based on USDT amount
  const tokensBought = tokenPrice > 0 ? (amountUSDT / tokenPrice) : 0;
  const tokensBoughtDisplay = tokensBought.toFixed(6);  // Decimal for precision

  // Max possible based on wallet, available area, tokens
  const maxPossibleUSDT = Math.min(
    walletBalance,
    availableArea * perSqftPrice,
    availableTokens * tokenPrice
  );

  const [transferTokens, setTransferTokens] = useState(10);
  const [transferWallet, setTransferWallet] = useState("");

  const navigate = useNavigate();
  const images =
    Array.isArray(property?.images) && property.images.length > 0
      ? property.images
      : property?.image
      ? [property.image]
      : [];

  const totalImages = images.length;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!totalImages || totalImages <= 4) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 >= totalImages ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [totalImages]);

  const handleBuyTokens = async () => {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (!token) {
      toast.warning("Please login to continue and buy Properties");
      return;
    }

    if (amountUSDT <= 0 || amountUSDT > maxPossibleUSDT) {
      toast.warning("Invalid amount. Check your balance and available area.");
      return;
    }

    try {
      setIsBuying(true);

      const payload = {
        propertyId: property.backendId,
        amount_usd: amountUSDT,
        investment_type: "TOKENIZED",
      };

      await axios.post(`${appConfig.baseURL}/user/properties/invest`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        "Tokens purchased successfully. Investment added to your account."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to complete the purchase. Please try again later."
      );
    } finally {
      setIsBuying(false);
    }
  };

  const handleTransferTokens = async () => {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (!token) {
      toast.warning("Please login to transfer tokens");
      return;
    }

    if (!transferWallet) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    try {
      const payload = {
        propertyId: property.backendId,
        toWallet: transferWallet,
        tokens: transferTokens,
      };

      const res = await axios.post(
        `${appConfig.baseURL}/user/properties/transfer-tokens`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Tokens transferred successfully");

      setTransferWallet("");
      setTransferTokens(10);
    } catch (error) {
      console.error(
        "Transfer Token Error:",
        error?.response?.status,
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to complete the transfer. Please try again later."
      );
    }
  };

  const visibleImages = [];

  if (totalImages > 0) {
    for (let i = 0; i < Math.min(4, totalImages); i++) {
      visibleImages.push(images[(activeIndex + i) % totalImages]);
    }
  }

  return (
    <div className="space-y-6">
      <div
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 cursor-pointer 
                  text-[#4A5565] text-md font-semibold 
                  hover:text-[#101828] transition"
      >
        <FaArrowLeft className="text-lg" />
        <span>Back to Tokenized Properties</span>
      </div>

      {/* IMAGE */}
      <div className="
  flex flex-col sm:flex-row
  gap-4
  bg-white rounded-lg p-4
">

        {/* LEFT THUMBNAILS */}
        <div
          className="
            flex flex-row sm:flex-col
            gap-3
            order-2 sm:order-1
            overflow-x-auto sm:overflow-visible
            scrollbar-hide
          "
        >
          {visibleImages.map((img, index) => {
            const realIndex = (activeIndex + index) % totalImages;

            return (
              <button
                key={realIndex}
                onClick={() => setActiveIndex(realIndex)}
                className={`w-20 h-16 sm:w-24 sm:h-20
        shrink-0
        rounded-xl overflow-hidden
        border-2 transition
        ${index === 0
                    ? "border-[#2460F5]"
                    : "border-transparent"
                  }`}
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

        {/* FEATURE IMAGE */}
        <div className="
    relative
    rounded-3xl overflow-hidden
    flex-1
    order-1 sm:order-2
  ">
          <img
            src={images[activeIndex] || "/placeholder.jpg"}
            alt={property.title}
            className="
              w-full
              h-[240px] sm:h-[356px]
              object-cover
              transition-all duration-300
            "
          />

          {/* BADGES */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <IoTrendingUpOutline /> +{property.growth}%
            </span>
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              {property.chain}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              className="w-9 h-9 flex items-center justify-center 
                   bg-white rounded-full shadow 
                   hover:bg-gray-100 transition"
            >
              <CiHeart className="text-lg text-[#101828]" />
            </button>

            <button
              className="w-9 h-9 flex items-center justify-center 
                   bg-white rounded-full shadow 
                   hover:bg-gray-100 transition"
            >
              <CiShare2 className="text-lg text-[#101828]" />
            </button>
          </div>
        </div>

      </div>


      {/* TITLE */}
      <div>
        <h2 className="text-4xl font-semibold text-[#000] mb-1">
          {property.title}
        </h2>
        <p className="flex items-center gap-2 text-[#000000E5] font-medium text-lg">
          <IoLocationOutline className="text-xl" />
          <span>{property.location}</span>
        </p>

      </div>

      <div className="sm:p-4 p-2 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">

        <div className="bg-white border-b border-[#E5E7EB]">


          <div className="grid grid-cols-2 sm:flex sm:gap-6 px-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium text-left
        ${activeTab === tab.key
                    ? "sm:border-b-2 sm:border-[#2460F5] text-[#155DFC]"
                    : "text-[#4A5565]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>



        </div>

        {activeTab === "overview" && (
          <div className="space-y-6 p-4">

            {/* ABOUT */}
            <div className="">
              <h3 className="font-semibold text-xl text-[#101828] mb-1">About This Property</h3>
              <p className="text-sm text-[#4A5565] text-md font-normal leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* BLOCKCHAIN INFO */}
            {/* <div className="bg-gradient-to-br from-[#F5F6FF] to-[#EFF6FF] border border-[#F3E8FF] rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-xl text-[#101828] mb-1">Blockchain Information</h3>
              <InfoRow label="Network" value={property.network} />
              <InfoRow
                label="Smart Contract"
                value={
                  <span className="inline-flex items-center gap-2 text-[#2460F5] cursor-pointer hover:underline">
                    <span className="text-[#155DFC] text-sm">{property.token_address}</span>
                    <FiLink className="text-xl text-[#6A7282]" />
                  </span>
                }
              />

              <InfoRow
                label="Total Supply"
                value={property.totalSupply}
              />
              <InfoRow
                label="Transferable"
                value={
                  <span className="flex items-center gap-1 text-[#00A63E]">
                    <FiShield /> {property.transferable}
                  </span>
                }
              />
            </div> */}

            {/* PROPERTY DETAILS */}
            <div className="py-2">
              <h3 className="font-semibold text-xl text-[#101828] mb-4">Property Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-[#4A5565]">

                  <p className="flex items-center gap-1 text-sm mb-1 gap-2 ">
                    <LuBed className="text-sm" />
                    <span>Bedrooms</span>
                  </p>
                  <p className="font-semibold text-2xl text-[#101828]">{property.beds}</p>
                </div>

                <div className="bg-[#F9FAFB] rounded-xl p-4 text-[#4A5565]">
                  <p className="flex items-center text-sm mb-1 gap-2 ">
                    <LuBath className="text-sm" />
                    <span>Bathrooms</span>
                  </p>
                  <p className="font-semibold text-2xl text-[#101828]">{property.baths}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-[#4A5565]">
                  <p className="flex items-center text-sm mb-1 gap-2 ">
                    <CgArrowsExpandRight className="text-sm" />
                    <span>Area</span>
                  </p>
                  <p className="font-semibold text-2xl text-[#101828]">{property.area}</p>
                </div>
              </div>
            </div>

            {/* TOKEN PRICE HISTORY */}
            {/* <div className="">
              <h3 className="font-semibold text-xl text-[#101828] mb-4">Token Price History</h3>
              <div className="bg-[#F3FAFF] rounded-2xl p-5 space-y-6">

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[#6A7282] mb-1">
                      Current Token Price
                    </p>
                    <p className="text-3xl font-semibold text-[#101828]">
                      ${property.tokenPrice}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[#6A7282] mb-1">
                      Since Launch
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      +{property.growth}%
                    </p>
                  </div>
                </div>

                <div className="h-32 rounded-xl flex items-end justify-between px-4 pb-3 text-xs text-[#6A7282]">
                  {["8", "9", "10", "11", "12", "13"].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>

              </div>
            </div> */}


          </div>
        )}



        {activeTab === "buy" && (
          <div ref={buyTabRef} className="p-4 space-y-6">

            {/* ================= PURCHASE TOKENS ================= */}
            {/* <div className="rounded-2xl bg-gradient-to-br from-[#F5FBFF] to-[#EFF6FF] p-4">

              <p className="text-xl font-semibold text-[#101828] mb-3">
                Purchase Property
              </p>

            
              <div className="mb-4">
                <p className="text-sm text-[#364153] font-medium mb-2">
                  Enter Amount In USDT
                </p>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountUSDT}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (isNaN(val)) val = 0;
                      val = Math.max(0, Math.min(maxPossibleUSDT, val));
                      setAmountUSDT(val);
                    }}
                    className="
                          w-full h-[44px]
                          rounded-xl
                          border border-[#E5E7EB]
                          px-4 py-2
                          text-2xl text-[#101828]
                          font-bold
                          outline-none my-3
                        "
                  />

                  
                  <button
                    onClick={() => setAmountUSDT(maxPossibleUSDT)}
                    disabled={maxPossibleUSDT <= 0}
                    className="absolute right-2 top-[14px] px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    MAX
                  </button>
                </div>

                <p className="text-sm font-medium text-[#4A5565] mt-1">
                  Available Area: {property.property_totalAvailableArea} sqft
                </p>
                <p className="text-sm font-medium text-[#4A5565] mt-1">
                  Per Sqft Price: ${property.property_per_sqft_price_usd}
                </p>
                <p className="text-sm font-medium text-[#4A5565] mt-1">
                  Available tokens: {property.available_tokens_supply}
                </p>
                <p className="text-sm font-medium text-[#4A5565] mt-1">
                  Deposit Balance: ${walletBalance}
                </p>
              </div>

              
              <div className="bg-white rounded-xl px-1 sm:px-4 py-3 text-sm font-medium space-y-2">
                <div className="flex justify-between mb-3">
                  <span className="text-[#4A5565]">Per Sqft Price</span>
                  <span className="font-bold text-base sm:text-xl text-[#101828]">
                    ${perSqftPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-[#4A5565]">Purchase Area</span>
                  <span className="font-bold text-base sm:text-xl text-[#16A34A]">
                    {sqftOwnedDisplay} sqft
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-[#4A5565]">Tokens to Buy</span>
                  <span className="font-bold text-base sm:text-xl text-[#155DFC]">
                    {tokensBoughtDisplay}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-[#4A5565]">Total Investment</span>
                  <span className="font-bold text-base sm:text-xl text-[#00A63E]">
                    ${amountUSDT.toLocaleString()}
                  </span>
                </div>
              </div>

             
              <button
                disabled={amountUSDT <= 0 || isBuying}
                onClick={handleBuyTokens}
                className={`
                  mt-4 w-full h-[44px]
                  flex items-center justify-center gap-2
                  rounded-xl
                  bg-gradient-to-r from-[#2460F5] to-[#3B1DDA]
                  shadow-[0px_4px_6px_-4px_rgba(70,110,255,0.3),_0px_10px_15px_-3px_rgba(70,104,255,0.3)]
                  text-white text-sm font-semibold
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:brightness-110
                `}
              >
                {isBuying ? (
                  <>
                    
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <SlBasket className="text-lg" />
                    <span>Buy Properties – ${amountUSDT.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div> */}

            <div className="
  rounded-2xl 
  bg-gradient-to-br from-[#F5FBFF] to-[#EFF6FF] 
  p-5 sm:p-6 lg:p-7 
  space-y-6
">

  <p className="text-xl sm:text-2xl font-semibold text-[#101828]">
    Purchase Property
  </p>

  {/* Input section */}
  <div className="space-y-4">
    <label className="block text-sm font-medium text-[#364153]">
      Enter Amount In USDT
    </label>

    <div className="relative">
      <input
        type="number"
        step="0.01"
        min="0"
        value={amountUSDT}
        onChange={(e) => {
          let val = Number(e.target.value);
          if (isNaN(val)) val = 0;
          val = Math.max(0, Math.min(maxPossibleUSDT, val));
          setAmountUSDT(val);
        }}
        className="
          w-full 
          h-12 sm:h-14
          rounded-xl 
          border border-[#D1D9E0] 
          px-4 sm:px-5 
          text-xl sm:text-2xl 
          font-bold 
          text-[#101828] 
          bg-white 
          outline-none 
          focus:border-[#2460F5] 
          focus:ring-1 
          focus:ring-[#2460F5]/30
          appearance-none
          [appearance:textfield] 
          [&::-webkit-outer-spin-button]:appearance-none 
          [&::-webkit-inner-spin-button]:appearance-none
        "
        placeholder="0.00"
      />

      {/* MAX button */}
      <button
        type="button"
        onClick={() => setAmountUSDT(maxPossibleUSDT)}
        disabled={maxPossibleUSDT <= 0}
        className="
          absolute 
          right-2 sm:right-3 
          top-1/2 
          -translate-y-1/2 
          px-3 sm:px-4 
          py-1.5 
          text-xs sm:text-sm 
          font-semibold 
          bg-[#2460F5] 
          hover:bg-[#1e53e8] 
          disabled:bg-gray-300 
          disabled:text-gray-500 
          text-white 
          rounded-lg 
          transition-colors
        "
      >
        MAX
      </button>
    </div>

    {/* Available info - better mobile layout */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#4A5565] font-medium">
      <div>
        Available Area: <span className="font-semibold text-[#101828]">
          {property.property_totalAvailableArea} sqft
        </span>
      </div>
      <div>
        Per Sqft Price: <span className="font-semibold text-[#101828]">
          ${property.property_per_sqft_price_usd}
        </span>
      </div>
      <div>
        Available Tokens: <span className="font-semibold text-[#101828]">
          {property.available_tokens_supply}
        </span>
      </div>
      <div>
        Deposit Balance: <span className="font-semibold text-[#101828]">
          ${walletBalance?.toLocaleString() || "0"}
        </span>
      </div>
    </div>
  </div>

  {/* Summary */}
  <div className="
    bg-white 
    rounded-xl 
    border border-[#E5E7EB] 
    px-4 sm:px-5 
    py-4 
    space-y-3 
    text-sm sm:text-base
  ">
    <div className="flex justify-between items-center">
      <span className="text-[#4A5565]">Per Sqft Price</span>
      <span className="font-semibold text-[#101828]">
        ${perSqftPrice.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-[#4A5565]">Purchase Area</span>
      <span className="font-semibold text-[#16A34A]">
        {sqftOwnedDisplay} sqft
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-[#4A5565]">Tokens to Buy</span>
      <span className="font-semibold text-[#155DFC]">
        {tokensBoughtDisplay}
      </span>
    </div>

    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
      <span className="text-[#4A5565] font-medium">Total Investment</span>
      <span className="text-lg sm:text-xl font-bold text-[#00A63E]">
        ${amountUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  </div>

  {/* Buy button */}
  <button
    disabled={amountUSDT <= 0 || isBuying}
    onClick={handleBuyTokens}
    className={`
      w-full 
      h-12 sm:h-14 
      flex items-center justify-center gap-2.5
      rounded-xl 
      bg-gradient-to-r from-[#2460F5] to-[#3B1DDA]
      text-white 
      font-semibold 
      text-base sm:text-lg
      shadow-md 
      hover:brightness-110 
      active:brightness-95 
      transition-all 
      disabled:opacity-60 
      disabled:cursor-not-allowed
      disabled:hover:brightness-100
    `}
  >
    {isBuying ? (
      <>
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Processing...
      </>
    ) : (
      <>
        <SlBasket className="text-xl" />
        Buy Properties – ${amountUSDT.toLocaleString(undefined, { minimumFractionDigits: 0 })}
      </>
    )}
  </button>

</div>

          </div>
        )}




        {activeTab === "marketplace" && (
          <div className="p-2 sm:p-4 space-y-6">

            {/* ================= LIST TOKENS ================= */}
            <div className="bg-gradient-to-br from-[#E6EEFF] to-[rgba(218,230,255,0.29)] border border-[#FFEDD4] rounded-2xl p-5 space-y-4">
              <h3 className="text-xl font-semibold text-[#101828]">
                List Tokens for Sale
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-[#364153] mb-1 block">
                    Number of Tokens
                  </p>
                  <input
                    defaultValue="10"
                    className="w-full rounded-xl border font-medium border-[#E5E7EB] bg-[#F3F7FF] text-[#101828]  px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#364153]  mb-1 block">
                    Price per Token ($)
                  </p>
                  <input
                    defaultValue={property.tokenPrice}
                    className="w-full rounded-xl border font-medium border-[#E5E7EB] bg-[#F3F7FF] text-[#101828] px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-md font-medium text-[#4A5565]">
                  Total Sale Value
                </span>
                <span className="font-bold text-2xl text-[#F54900]">
                  ${property.tokenPrice * 10}
                </span>
              </div>

              <button className="
                    w-full h-[44px]
                    rounded-xl
                    bg-gradient-to-r from-[#2460F5] to-[#3B1DDA]
                    text-white text-md font-semibold
                    shadow
                  ">
                $&nbsp; List Tokens for Sale
              </button>
            </div>

            {/* ================= BUY FROM HOLDERS ================= */}
            <div>
              <h3 className="text-xl font-semibold text-[#101828] mb-3">
                Buy from Other Holders
              </h3>

              <div className="space-y-3">
                {property.marketplace?.listings?.map((l, i) => (
                  <div
                    key={i}
                    className="
                              bg-white
                              border border-[#E5E7EB]
                              rounded-2xl
                              px-5 py-4
                              flex flex-col sm:flex-row
                              gap-4
                              sm:items-center
                            "
                  >
                    {/* LEFT CONTENT */}
                    <div className="flex flex-col gap-4 flex-1">

                      {/* TOP : Avatar + Address */}
                      <div className="flex items-center gap-4">
                        <div className="
                                  w-10 h-10 shrink-0
                                  rounded-full
                                  bg-gradient-to-r from-[#2460F5] to-[#3B1DDA]
                                  text-white text-sm font-semibold
                                  flex items-center justify-center
                                ">
                          {l.seller.slice(2, 4).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-[#101828] leading-tight">
                            {l.seller}
                          </p>
                          <p className="text-xs text-[#6A7282] mt-0.5">
                            1 hour ago
                          </p>
                        </div>
                      </div>

                      {/* STATS */}
                      <div className="
                                grid grid-cols-1 sm:grid-cols-3
                                gap-4
                              ">
                        <div>
                          <p className="text-xs text-[#6A7282] mb-1">Tokens</p>
                          <p className="text-sm font-semibold text-[#101828]">
                            {l.tokens}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#6A7282] mb-1">Price/Token</p>
                          <p className="text-sm font-semibold text-[#2460F5]">
                            ${l.price}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#6A7282] mb-1">Total Price</p>
                          <p className="text-sm font-semibold text-[#101828]">
                            ${(l.tokens * l.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* BUY BUTTON */}
                    <div className="sm:self-center w-full sm:w-auto">
                      <button
                        className="
                                  w-full sm:w-auto
                                  px-6 py-3
                                  rounded-xl
                                  bg-gradient-to-r from-[#2460F5] to-[#3B1DDA]
                                  text-white text-sm font-medium
                                  hover:brightness-110
                                  transition
                                "
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                )) || (
                    <p className="text-center text-[#4A5565]">No listings available yet.</p>
                  )}
              </div>

              {/* ================= LIQUIDITY ================= */}
              <div className="mt-4 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white flex items-center justify-center">
                  <IoAnalyticsOutline className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#101828]">
                    Liquidity Pool
                  </p>
                  <p className="text-xs text-[#6A7282]">
                    Coming soon – Instant token swaps with enhanced liquidity
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}



        {activeTab === "documents" && (
          <div className="p-4 space-y-4">
            <p className="text-md font-medium text-[#4A5565]">
              Access all important documents including blockchain contracts, property deeds, and valuation reports.
            </p>

            {property.documents.length > 0 ? (
              property.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-[#E5E7EB] rounded-xl p-4 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] flex items-center justify-center">
                      <IoDocumentText className="text-xl" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#101828]">
                        {doc.name}
                      </p>
                      <p className="text-xs text-[#6A7282]">
                        {doc.type}
                      </p>
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
              ))
            ) : (
              <p className="text-center text-[#4A5565]">No documents available.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}



/* ===== Reusable ===== */

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center text-md">
    <span className="font-normal text-[#4A5565]">
      {label}
    </span>

    <span className="font-bold text-md text-[#101828] break-all sm:text-right">
      {value}
    </span>
  </div>
);