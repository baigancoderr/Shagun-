import { IoAnalyticsOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { IoTrendingUpOutline} from "react-icons/io5";
import { SlBasket } from "react-icons/sl";
import { FiUsers } from "react-icons/fi";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import axios from "axios";
import { appConfig } from "../../../../config/appConfig";

export default function TokenizedSidebar({ property }) {



const navigate = useNavigate();


const handleBuyTokens = async () => {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

  if (!token) {
    toast.warning("Please login to continue and buy Properties");
    return;
  }

  try {
    const payload = {
      propertyId: property.backendId,
      amount_usd: property.mininvest, // sidebar min investment
      investment_type: "TOKENIZED",
    };

    const res = await axios.post(
      `${appConfig.baseURL}/user/properties/invest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success(
      "Property purchased successfully. Investment added to your account."
    );

    console.log("Sidebar Buy Property Response:", res.data);

  } catch (error) {
    console.error(
      "Sidebar Buy property Error:",
      error?.response?.status,
      error?.response?.data
    );

    toast.error(
      error?.response?.data?.message ||
      "Unable to complete purchase. Please try again."
    );
  }
};


  return (
    <div className="space-y-4 sticky top-24">

      {/* PRICE CARD */}
      <div className="bg-gradient-to-r from-[#F7F9FF] to-[#B9CCE7]/10  rounded-3xl p-6 space-y-4 shadow-sm">
        <div>
          <p className="text-sm font-normal text-[#000000]">Total Area</p>
          <p className="text-4xl font-bold my-1  text-[#000000]">
            {property.propertyTotalArea} sqft
          </p>
          <p className="text-[#000000] font-normal text-sm flex items-center gap-1">
            <IoTrendingUpOutline className="text-[#000000] font-bold text-lg " /> {property.growth}% since launch
          </p>
        </div>

        <div className="p-2">
          <div className="flex justify-between text-sm mb-4">
            <p className="text-[#030303]">Property Valuation</p>
            <p className="text-[#030303] font-semibold text-lg">${property.propertyValue}</p>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <p className="text-[#030303]">Total Tokens Supply</p>
            <p className="text-[#030303] font-semibold text-lg">{property.total_tokens_supply}</p>
          </div>
           <div className="flex justify-between text-sm mb-4">
            <p className="text-[#030303]">Available tokens</p>
            <p className="text-[#030303] font-semibold text-lg">{property.available_tokens_supply}</p>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <p className="text-[#030303]">Sold Tokens</p>
            <p className="text-[#030303] text-lg font-semibold">{property.sold_tokens_supply}</p>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <p className="text-[#030303]">Total Area Available</p>
            <p className="text-[#030303] text-lg font-semibold">{(Number(property.property_totalAvailableArea) || 0).toFixed(4)} sqft</p>
          </div>
        </div>



        <button
          onClick={() =>
            navigate(`/user/property-investments/tokenized/${property.id}`, {
              state: { tab: "buy" }
            })
          }
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white text-md font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition"
        >
          <SlBasket className="text-2xl" /> Buy Properties
        </button>


        <button className="w-full py-3 flex items-center justify-center gap-2 bg-[#FFFFFF1A] rounded-xl border border-[#FFFFFF4D] text-md text-black font-medium">
          <IoAnalyticsOutline className="text-lg" />
          <span>View Marketplace</span>
        </button>

      </div>

      {/* TOKEN STATS */}
      {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-lg text-[#101828]">Token Statistics</h4>
        <div className="flex justify-between text-sm">
          <span className="text-[#4A5565]">Available Tokens</span>
          <span className="font-semibold text-md text-[#101828]">{property.avaitoken}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#4A5565]">Token Holders</span>
          <span className="flex items-center gap-2 font-semibold text-md text-[#101828]">
            <FiUsers className="text-[#6A7282] text-lg" />
            <span>{property.tokenHolders}</span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#4A5565]">Initial Token Price</span>
          <span className="font-semibold text-md text-[#101828]">${property.initTokePri}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#4A5565]">Price Growth</span>
          <span className="font-semibold text-md text-[#00A63E]">{property.growth}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#4A5565]">Min. Investment</span>
          <span className="font-semibold text-md text-[#101828]">${property.mininvest}</span>
        </div>
      </div> */}

      {/* INVESTMENT MODEL */}
      <div className="bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] border border-[#B9F8CF] rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-lg text-[#101828]">
          Investment Model
        </h4>

        {/* Item */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00C950]">
            <FaArrowTrendUp className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#101828]">
              Capital Appreciation
            </p>
            <p className="text-xs text-[#4A5565]">
              Earn through token price growth
            </p>
          </div>
        </div>

        {/* Item */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2B7FFF]">
            <IoAnalyticsOutline className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#101828]">
              P2P Trading
            </p>
            <p className="text-xs text-[#4A5565]">
              Buy and sell on marketplace
            </p>
          </div>
        </div>

        {/* Item */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#AD46FF]">
            <FaRegCircleCheck className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#101828]">
              Blockchain Verified
            </p>
            <p className="text-xs text-[#4A5565]">
              Transparent on-chain ownership
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

