import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield } from "@fortawesome/free-solid-svg-icons";

export default function ReadymadeSidebar({ property, setActiveTab }) {

  if (!property) {
    return (
      <div className="sticky top-24 bg-white border rounded-2xl p-5 text-center">
        <p className="text-gray-500">Property details are loading...</p>
      </div>
    );
  }

  const [amount, setAmount] = useState(property?.defaultInvestment || 1000);

// ================= CORRECT & ROBUST CALCULATIONS =================
const property_per_sqft_price_usd = property?.property_per_sqft_price_usd || 0;
const minInvestment = property?.min_invest || 0;

// Number of SQFT (tokens) user will own
const sqftOwned = property_per_sqft_price_usd > 0 
                ? (amount / property_per_sqft_price_usd) 
                : 0;

// ✅ Smart rental yield detection (tries multiple common field paths)
const getAnnualRentalYieldPercent = () => {
  // 1. Preferred field (as you specified)
  if (typeof property?.financials?.metrics?.rentalIncome === "number") {
    return property.financials.metrics.rentalIncome;
  }
  // 2. Other common field names
  if (typeof property?.rentalYield === "number") return property.rentalYield;
  if (typeof property?.yield === "number") return property.yield;
  if (typeof property?.annualYield === "number") return property.annualYield;

  // 3. Fallback: derive from annual income + property value
  if (property?.annualIncome && property?.propertyValue && property.propertyValue > 0) {
    return (property.annualIncome / property.propertyValue) * 100;
  }

  return 0; // no yield data available
};

const rentalYieldPercent = getAnnualRentalYieldPercent();

// ✅ FIXED & CORRECT INCOME CALCULATIONS
const monthlyRental  = (amount * property.rental_percentage) / 100;           // Annual rental income in USD
const annualRental = monthlyRental * 12;                             // Monthly rental income
const dailyRental   = monthlyRental / 30;                             // Daily (kept as per your existing UI style)


// Optional: Nicely formatted values for display
const sqftOwnedDisplay = sqftOwned.toFixed(4);
const monthlyRentalDisplay = monthlyRental.toFixed(2);
const annualRentalDisplay  = annualRental.toFixed(2);
const dailyRentalDisplay   = dailyRental.toFixed(2);

  return (
    <div className="sticky top-24 bg-white border rounded-2xl p-6 space-y-6 shadow-sm">
      {/* ================= PROPERTY SUMMARY ================= */}
      <div className="space-y-3">
        <div>
          <span className="text-gray-500 text-sm">Property Value</span>
          <p className="text-2xl font-semibold text-[#101828]">
            ${property?.propertyValue?.toLocaleString() || "N/A"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Per SQFT Price</span>
            <p className="font-semibold text-[#101828]">
              ${property?.property_per_sqft_price_usd?.toLocaleString() || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Min. Investment</span>
            <p className="font-semibold text-[#101828]">
              ${property.minInvestment || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Available Area</span>
          <span className="font-semibold text-green-600">
            {property?.property_totalAvailableArea || 0} SQFT
          </span>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ================= INVESTMENT CALCULATOR ================= */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="font-semibold text-xl text-[#101828] mb-5">
          Investment Calculator
        </h3>

        <div className="mb-6">
          <label className="text-sm text-gray-600 block mb-1.5">
            Investment Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (isNaN(val) || val < 0) val = 0;
                setAmount(val);   // ← NOW ALLOWS ANY VALUE (no min clamp)
              }}
              className="w-full text-gray-700 pl-8 pr-4 py-3.5 text-lg font-semibold rounded-2xl border border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Warning when below minimum (but still allows entry) */}
          {amount > 0 && amount < minInvestment && (
            <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
              ⚠ Below minimum investment (${minInvestment.toLocaleString()})
            </p>
          )}
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">You will own</span>
            <span className="font-bold text-xl text-[#101828]">{sqftOwnedDisplay}</span>
            <span className="text-gray-500 text-xs">SQFT</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Rental Income</span>
            <span className="font-bold text-xl text-green-600">
              ${monthlyRental.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Annual Rental Income</span>
            <span className="font-bold text-xl text-green-600">
              ${annualRental.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-600">Daily Rental Income</span>
            <span className="font-bold text-lg text-green-600">
              ${dailyRental.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= RISK ASSESSMENT ================= */}
      <div className="flex items-start gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <FontAwesomeIcon
          icon={faShield}
          className="text-yellow-600 text-4xl mt-1 flex-shrink-0"
        />
        <div>
          <p className="text-sm text-gray-600">Risk Assessment</p>
          <p className="text-yellow-700 font-medium mt-1">
            {property?.risk || property?.riskLevel || "Medium Risk"}
          </p>
        </div>
      </div>

      {/* ================= CTA BUTTONS ================= */}
      <button
        onClick={() => setActiveTab("Financial Details")}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg transition-all"
      >
        Buy Properties Now
      </button>

      <button className="w-full py-4 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all">
        Sell Owned Share
      </button>

      {/* ================= PROPERTY PARTNER ================= */}
      <div className="text-sm pt-2 border-t border-gray-100">
        <p className="text-gray-500 mb-1">Property Partner</p>
        <p className="font-semibold text-[#101828] flex items-center gap-2">
          {property?.partner?.name || "Not specified"}
          {property?.partner?.verified && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
          )}
        </p>
      </div>
    </div>
  );
}