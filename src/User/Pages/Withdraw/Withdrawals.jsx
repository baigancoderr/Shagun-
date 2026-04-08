import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiDollarSign } from "react-icons/fi";
import { TbWallet } from "react-icons/tb";
import { FaWallet, FaCopy } from "react-icons/fa";
import axios from "axios";
import { appConfig } from "../../../config/appConfig";
import { useDemoMode } from "../../Contexts/DemoModeContext";
import { getDemoData } from "../../Data/demoData";

const Withdrawals = () => {
  const { isDemoMode } = useDemoMode();
  const [walletType, setWalletType] = useState("my");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState({
    my: 0,
    principal: 0,
    deposit: 0,
    emgt: 0,
    referral: 0,
  });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [withdrawalDetails, setWithdrawalDetails] = useState(null);

  const fetchBalance = async () => {
    // If in demo mode, use demo data
    if (isDemoMode) {
      const demoWithdrawalData = getDemoData("withdrawalBalance");
      setBalance(demoWithdrawalData.balance);
      setWalletAddress(demoWithdrawalData.walletAddress);
      return;
    }

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to fetch balance");
        return;
      }
      const response = await axios.get(`${appConfig.baseURL}/user/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchBalance response:", response.data); // Debug log
      const walletData = response.data.data || {};
      setBalance({
        my: walletData.myWallet || 0,
        principal: walletData.principalWallet || 0,
        deposit: walletData.depositWallet || 0,
        emgt: walletData.emgtWallet || 0,
        referral: walletData.referralWallet || 0,
      });
      const walletAddress = walletData.walletAddress || "N/A";
      setWalletAddress(walletAddress);
    } catch (error) {
      console.error("fetchBalance error:", error); // Debug log
      toast.error("Failed to fetch balance");
      setBalance({ my: 0, principal: 0, deposit: 0, emgt: 0, referral: 0 });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [isDemoMode]);

  const handleCopyAddress = () => {
    if (walletAddress === "N/A") {
      toast.error("No wallet address available to copy");
      return;
    }
    navigator.clipboard.writeText(walletAddress).then(() => {
      toast.success("Wallet address copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy wallet address");
    });
  };

  const handleWithdraw = async () => {
    const minimumWithdrawal = 5;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > balance[walletType]) {
      toast.error("Insufficient balance in selected wallet");
      return;
    }
    if (parseFloat(amount) < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }
    if (walletAddress === "N/A") {
      toast.error("Please set a valid wallet address before withdrawing");
      return;
    }

    // If in demo mode, show OTP input directly
    if (isDemoMode) {
      setShowOtpInput(true);
      toast.info("Demo OTP: 123456 (Demo Mode)");
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to proceed with withdrawal");
        setLoading(false);
        return;
      }

      // Request OTP with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const otpResponse = await axios.post(
        `${appConfig.baseURL}/user/request-withdrawal-otp`,
        {
          walletType,
          amount: parseFloat(amount),
          currencyType: "USDT",
          walletAddress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      console.log("request-withdrawal-otp response:", otpResponse.data); // Debug log
      if (otpResponse.data.status !== "success" || !otpResponse.data.data.requestId) {
        throw new Error("Invalid OTP response");
      }

      setRequestId(otpResponse.data.data.requestId);
      setShowOtpInput(true);
      toast.success("OTP sent to your email. Please check your inbox and enter the OTP below.");
    } catch (error) {
      console.error("handleWithdraw error:", error); // Debug log
      const message =
        error.response?.data?.message ||
          error.message === "signal is aborted"
          ? "Request timed out. Please try again."
          : "Failed to request withdrawal OTP. Please verify your email address.";
      toast.error(message);
      setShowOtpInput(false);
      setRequestId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const minimumWithdrawal = 5; // Set minimum withdrawal amount
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > balance[walletType]) {
      toast.error("Insufficient balance in selected wallet");
      return;
    }

    if (parseFloat(amount) < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    // If in demo mode, show success message
    if (isDemoMode) {
      toast.success("Withdrawal request submitted successfully! (Demo Mode)");
      setAmount("");
      setOtp("");
      setShowOtpInput(false);
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to proceed with withdrawal");
        return;
      }

      const response = await axios.post(
        `${appConfig.baseURL}/user/withdraw`,
        {
          walletType,
          amount: parseFloat(amount),
          otp,
          currencyType: "USDT", // Hardcoded for now, adjust if dynamic
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
      setAmount("");
      setOtp("");
      setShowOtpInput(false);
      // Refetch balance after successful request (optional, since deduction is on admin approval)
      await fetchBalance();
    } catch (error) {
      const message =
        error.response?.data?.message || "Withdrawal request failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getWalletLabel = (type) => {
    switch (type) {
      case "my":
        return "My Wallet";
      case "principal":
        return "Principal Wallet";
      case "deposit":
        return "Deposit Wallet";
      case "emgt":
        return "EMGT Wallet";
      case "referral":
        return "Referral Wallet";
      default:
        return "";
    }
  };

  return (
    <>
     <div className="text-center py-2 " >
    <h2 className="text-2xl md:text-3xl font-bold text-[#FF6000]">
      Withdraw Funds
    </h2>
    <p className="text-m text-white mt-2 max-w-lg mx-auto">
      Securely withdraw your funds from your selected wallet. Please review
      your wallet balance, address, and withdrawal details carefully before
      proceeding.
    </p>
  </div>

  {/* 4 Small Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 py-8 ">
    <div className="rounded-xl border border-[#2a2a2a] bg-[#181818] p-8 theme-card-style border-gradient">
      <h3 className="text-xl font-semibold text-white mt-2">Loyalty Points</h3>
      <p className="text-2xl font-bold text-[#FF6000] mt-3 ">0</p>
      <p className="text-s text-[#888] mt-3">
       Available Balance
      </p>
    </div>

   <div className="rounded-xl border border-[#2a2a2a] bg-[#181818] p-8 theme-card-style border-gradient">
      <h3 className="text-xl font-semibold text-white mt-2">SGN Token</h3>
      <p className="text-2xl font-bold text-[#FF6000] mt-3 ">0</p>
      <p className="text-s text-[#888] mt-3">
       Available Balance
      </p>
    </div>

     <div className="rounded-xl border border-[#2a2a2a] bg-[#181818] p-8 theme-card-style border-gradient">
      <h3 className="text-xl font-semibold text-white mt-2">Shoping Token </h3>
      <p className="text-2xl font-bold text-[#FF6000] mt-3 ">0</p>
      <p className="text-s text-[#888] mt-3">
       Available Balance
      </p>
    </div>

       <div className="rounded-xl border border-[#2a2a2a] bg-[#181818] p-8 theme-card-style border-gradient">
      <h3 className="text-xl font-semibold text-white mt-2">Total Withdrawable</h3>
      <p className="text-2xl font-bold text-[#FF6000] mt-3 ">0</p>
      <p className="text-s text-[#888] mt-3">
       Ready to Withdraw
      </p>
    </div>
  </div>
  
    <div className="max-w-xl theme-card-style  border-gradient mx-auto bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] space-y-6">
  {/* Heading */}
 

  {/* Wallet Selector */}
  <div>
    <label className="block text-[#aaaaaa] text-sm mb-2">
      Select Wallet
    </label>
    <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl gap-3 px-3 py-2 focus-within:ring-2 focus-within:ring-[#FF6000] transition-all">
      <div className="aspect-square bg-gradient-to-br from-[#FF6000] to-[#E3090D] rounded-full flex items-center justify-center text-white">
        <TbWallet className="m-2" />
      </div>
      <select
        value={walletType}
        onChange={(e) => setWalletType(e.target.value)}
        className="w-full py-2 bg-transparent text-white focus:outline-none"
        disabled={loading}
      >
        <option value="my" className="bg-[#1a1a1a] text-white">
          My Wallet
        </option>
        <option value="principal" className="bg-[#1a1a1a] text-white">
          Principal Wallet
        </option>
        <option value="deposit" className="bg-[#1a1a1a] text-white">
          Deposit Wallet
        </option>
        <option value="referral" className="bg-[#1a1a1a] text-white">
          Referral Wallet
        </option>
      </select>
    </div>
  </div>

  {/* Balance Info */}
  <div className="flex items-center justify-between bg-[#181818] border border-[#2a2a2a] px-4 py-3 rounded-xl text-[#cccccc] text-sm">
    <div className="flex items-center gap-2">
      <MdOutlineAccountBalanceWallet className="text-[#FF6000] text-xl" />
      Available Balance in {getWalletLabel(walletType)}:
    </div>
    <span className="text-white font-semibold">${balance[walletType]}</span>
  </div>

  {/* Wallet Address */}
  <div className="bg-[#181818] border border-[#2a2a2a] px-4 py-3 rounded-xl text-[#cccccc] text-sm">
    <div className="flex items-center gap-2">
      <FaWallet className="text-[#FF6000] text-xl" />
      <span>Wallet Address:</span>
    </div>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-white font-semibold break-all">{walletAddress}</span>
      <button
        onClick={handleCopyAddress}
        className="p-1 text-[#FF6000] hover:text-[#ff7b1a] transition"
        title="Copy wallet address"
        disabled={loading}
      >
        <FaCopy className="text-xl" />
      </button>
    </div>
  </div>

  {/* Warning Note */}
  <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
    <span className="font-semibold">Note:</span> Please ensure your wallet
    address is correct, as it will not be verified by our system prior to
    processing the withdrawal.
  </div>

  {/* Amount and OTP Inputs */}
  <div>
    <label className="block text-[#aaaaaa] text-sm mb-2">
      Enter Amount
    </label>
    <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl gap-3 px-3 py-2 focus-within:ring-2 focus-within:ring-[#FF6000] transition-all">
      <div className="aspect-square bg-gradient-to-br from-[#FF6000] to-[#E3090D] rounded-full flex items-center justify-center text-white">
        <FiDollarSign className="m-2" />
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="w-full py-2 bg-transparent text-white placeholder-[#555] focus:outline-none"
        disabled={loading}
      />
    </div>

    {showOtpInput && (
      <div className="mt-4">
        <label className="block text-[#aaaaaa] text-sm mb-2">
          Enter OTP
        </label>
        <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl gap-3 px-3 py-2 focus-within:ring-2 focus-within:ring-[#FF6000] transition-all">
          <div className="aspect-square bg-gradient-to-br from-[#FF6000] to-[#E3090D] rounded-full flex items-center justify-center text-white">
            <FiDollarSign className="m-2" />
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full py-2 bg-transparent text-white placeholder-[#555] focus:outline-none"
            disabled={loading}
          />
        </div>
      </div>
    )}

    <div className="text-sm mt-5 text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
      <span className="font-semibold">Note:</span> processing fee will be deducted from your withdrawal amount <span className="font-bold text-yellow-400">15%</span>.
    </div>
  </div>

  {/* Action Button */}
  <button
    onClick={showOtpInput ? handleOtpSubmit : handleWithdraw}
    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FF7A00] via-[#FF6000] to-[#E3090D] border border-[#ffcf99]/20 shadow-[0_8px_20px_rgba(255,96,0,0.25)] hover:from-[#E3090D] hover:via-[#FF6000] hover:to-[#FF7A00] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={loading}
  >
    {loading ? "Processing..." : showOtpInput ? "Submit OTP" : "Withdraw"}
  </button>

  {/* Withdrawal Confirmation */}
  {withdrawalDetails && (
    <div className="bg-[#181818] border border-[#2a2a2a] px-4 py-4 rounded-xl text-[#cccccc] text-sm">
      <h3 className="text-lg font-bold text-white mb-3">Withdrawal Details</h3>
      <p>
        <strong className="text-white">Status:</strong>{" "}
        {withdrawalDetails.status === "completed"
          ? "Completed"
          : "Pending Approval"}
      </p>
      <p>
        <strong className="text-white">Amount:</strong> $
        {withdrawalDetails.netAmount}
      </p>
      <p>
        <strong className="text-white">Transaction Charge:</strong> $
        {withdrawalDetails.transactionCharge}
      </p>
      <p>
        <strong className="text-white">Wallet Address:</strong>{" "}
        <span className="break-all">{withdrawalDetails.walletAddress}</span>
      </p>
      {withdrawalDetails.status === "completed" && (
        <p>
          <strong className="text-white">Transaction Hash:</strong>{" "}
          <a
            href={`https://bscscan.com/tx/${withdrawalDetails.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6000] hover:underline break-all"
          >
            {withdrawalDetails.txHash}
          </a>
        </p>
      )}
    </div>
  )}
</div>
</>
  );
};

export default Withdrawals;