import { useState, useEffect } from "react";
import { MdOutlineMail } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { FiPhone } from "react-icons/fi";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { FiLock } from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { FiSmartphone } from "react-icons/fi";
import { FiCreditCard } from "react-icons/fi";
import { LuBuilding2 } from "react-icons/lu";
import { FaCopy } from "react-icons/fa";
import { LuWallet } from "react-icons/lu";
import { FiExternalLink } from "react-icons/fi";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import Footer from "../Components/Comman/Footer";
import QRCode from "react-qr-code";

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    nationality: "Georgia",
    address: "",
    walletAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [kycStatus, setKycStatus] = useState(null);
  const [kycVerifiedAt, setKycVerifiedAt] = useState(null);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(true);

  // Wallet Update States
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [updatingWallet, setUpdatingWallet] = useState(false);
  const [copied, setCopied] = useState(false);

  // ==================== GOOGLE 2FA STATES ====================
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  // ===========================================================

  // Fetch Profile + KYC + 2FA Status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        // Profile
        const profileRes = await axios.get(`${appConfig.baseURL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = profileRes.data.data?.profile || {};

        setFormData({
          firstName: p.first_name || "",
          lastName: p.last_name || "",
          email: p.email || "",
          phone: p.mobile_number || "",
          dob: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
          nationality: p.country || "Georgia",
          address: p.address || "",
          walletAddress: p.walletAddress || "",
        });

        // KYC Status
        const kycRes = await axios.get(`${appConfig.baseURL}/user/get-kyc`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const kyc = kycRes.data.data?.kyc || {};
        setKycStatus(kyc.status || p.kycStatus || null);
        setKycVerifiedAt(kyc.verifiedAt || null);

        // ==================== 2FA STATUS ====================
        const twoFaRes = await axios.get(`${appConfig.baseURL}/user/2fa/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTwoFactorEnabled(twoFaRes.data?.data?.enabled || false);
        // ====================================================

      } catch (error) {
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Profile Update (unchanged)
  const handleProfileSubmit = async (e) => { /* ... same as before ... */ };
  // Password Update (unchanged)
  const handlePasswordSubmit = async (e) => { /* ... same as before ... */ };

  // Wallet functions (unchanged)
  const sendUpdateOtp = async () => { /* ... */ };
  const updateWalletAddress = async () => { /* ... */ };
  const handleCopy = async () => { /* ... */ };

  const isWalletSet = formData.walletAddress && 
                     formData.walletAddress !== "" && 
                     formData.walletAddress !== "NA" && 
                     formData.walletAddress.length > 10;

  // ==================== GOOGLE 2FA FUNCTIONS ====================

  const generate2FA = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await axios.post(`${appConfig.baseURL}/user/2fa/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;
      setSecretKey(data.secret);

      const issuer = "YourTradingApp"; // ← CHANGE TO YOUR APP NAME
      const otpauth = `otpauth://totp/${issuer}:${formData.email || "User"}?secret=${data.secret}&issuer=${issuer}`;
      setOtpauthUrl(otpauth);

      setVerifyCode("");
      setShow2FAModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start 2FA setup");
    }
  };

  const verifyAndEnable2FA = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter the 6-digit code from Google Authenticator");
      return;
    }

    setVerifying2FA(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      await axios.post(`${appConfig.baseURL}/user/2fa/verify`, {
        code: verifyCode,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerifyCode("");
      setOtpauthUrl("");
      setSecretKey("");
      toast.success("✅ Google 2FA enabled successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setVerifying2FA(false);
    }
  };

  const openDisableModal = () => setShowDisableModal(true);

  const confirmDisable2FA = async () => {
    if (disableCode.length !== 6) {
      toast.error("Please enter the 6-digit code from Google Authenticator");
      return;
    }

    setDisabling2FA(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      await axios.post(`${appConfig.baseURL}/user/2fa/disable`, {
        code: disableCode,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTwoFactorEnabled(false);
      setShowDisableModal(false);
      setDisableCode("");
      toast.success("Google 2FA has been disabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setDisabling2FA(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secretKey);
    toast.success("Secret key copied!");
  };

  // ===========================================================

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading profile...</div></div>;
  }

  return (
    <>
      <div className="theme-card-style border-gradient text-gray-800 p-5 rounded-md min-h-[80vh]">
        {/* Tabs - Added Security tab */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: "personal", label: "Personal Details" },
            { key: "password", label: "Password Details" },
            { key: "security", label: "Security" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "text-white border-b-2 border-blue-400 bg-gradient-to-b from-blue-700 to-blue-600 rounded-t"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== PERSONAL DETAILS ===================== */}
        {activeTab === "personal" && (
          /* ... your original personal tab content (unchanged) ... */
          <div className="space-y-8">
            {/* Personal Information Card - unchanged */}
            {/* KYC Card - unchanged */}
            {/* Bank & Wallet Grid - unchanged */}
          </div>
        )}

        {/* ===================== PASSWORD DETAILS ===================== */}
        {activeTab === "password" && (
          /* ... your original password tab content (unchanged) ... */
          <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-6">
            {/* ... existing password fields ... */}
          </form>
        )}

        {/* ===================== SECURITY (2FA) TAB ===================== */}
        {activeTab === "security" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.08)] p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-50">
                  <HiOutlineShieldCheck className="text-blue-600 text-3xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-gray-500">Protect your account with Google Authenticator</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-lg font-semibold">Google Authenticator</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium
                      ${twoFactorEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {twoFactorEnabled ? (
                        <>✅ <span>Enabled</span></>
                      ) : (
                        <>⛔ <span>Disabled</span></>
                      )}
                    </span>
                  </div>
                </div>

                {twoFactorEnabled ? (
                  <button
                    onClick={openDisableModal}
                    disabled={disabling2FA}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition disabled:opacity-70"
                  >
                    {disabling2FA ? "Disabling..." : "Disable 2FA"}
                  </button>
                ) : (
                  <button
                    onClick={generate2FA}
                    className="px-8 py-3 bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white rounded-2xl font-medium hover:brightness-105 transition"
                  >
                    Enable Google 2FA
                  </button>
                )}
              </div>

              {twoFactorEnabled && (
                <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm">
                  Your account is now protected with 2FA. You will be asked for a verification code every time you log in.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== 2FA ENABLE MODAL ===================== */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold">Set up Google 2FA</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-3xl text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="space-y-8">
              <div>
                <div className="font-medium text-gray-700 mb-2">1. Install Google Authenticator</div>
                <p className="text-sm text-gray-500">Get it from the App Store or Google Play Store.</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="font-medium text-gray-700 mb-3">2. Scan QR Code</div>
                <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                  <QRCode value={otpauthUrl} size={200} level="H" includeMargin />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-gray-700">3. Or enter key manually</div>
                  <button onClick={copySecret} className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                    <FaCopy /> Copy
                  </button>
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl font-mono text-sm break-all select-all">
                  {secretKey}
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">4. Enter 6-digit code from app</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-4xl tracking-[8px] font-mono border border-gray-300 rounded-2xl py-5 focus:outline-none focus:border-blue-500"
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndEnable2FA}
                disabled={verifying2FA || verifyCode.length !== 6}
                className="flex-1 py-4 bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white rounded-2xl font-medium disabled:opacity-60"
              >
                {verifying2FA ? "Verifying..." : "Verify & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 2FA DISABLE MODAL ===================== */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <h3 className="text-red-600 text-2xl font-semibold mb-2">Disable 2FA?</h3>
            <p className="text-gray-600 mb-8">This action will remove the extra security layer.</p>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Enter your current 2FA code</label>
              <input
                type="text"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-4xl tracking-[8px] font-mono border border-gray-300 rounded-2xl py-5"
                placeholder="123456"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setDisableCode("");
                }}
                className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisable2FA}
                disabled={disabling2FA || disableCode.length !== 6}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium disabled:opacity-60"
              >
                {disabling2FA ? "Disabling..." : "Yes, Disable 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet modal remains unchanged */}
       {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl text-gray-800 font-semibold mb-4">Update Wallet Address</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">New Wallet Address</label>
                <input type="text" value={newWalletAddress} onChange={(e) => setNewWalletAddress(e.target.value)} className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-2xl" placeholder="0x..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">Enter OTP</label>
                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-2xl text-center text-2xl" placeholder="123456" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1">Remark (Optional)</label>
                <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-2xl" placeholder="My personal wallet" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowWalletModal(false)} className="flex-1 py-3 text-gray-800 border border-gray-300 rounded-2xl font-medium">Cancel</button>
              <button onClick={updateWalletAddress} disabled={updatingWallet || !newWalletAddress || !otp} className="flex-1 py-3 bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white rounded-2xl font-medium">
                {updatingWallet ? "Updating..." : "Verify & Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyProfile;