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

  // Fetch Profile + KYC
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

  // Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errorObj = {};
    if (!formData.email.trim()) errorObj.email = "Email is required";
    if (!formData.walletAddress.trim()) errorObj.walletAddress = "Wallet Address is required";

    if (Object.keys(errorObj).length > 0) {
      setErrors(errorObj);
      Object.values(errorObj).forEach((msg) => toast.error(msg));
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      await axios.put(`${appConfig.baseURL}/user/profile/update`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        walletAddress: formData.walletAddress,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    const errorObj = {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      errorObj.password = "All fields are required";
    } else if (newPassword !== confirmPassword) {
      errorObj.password = "Passwords don't match";
    } else if (newPassword.length < 6) {
      errorObj.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errorObj).length > 0) {
      setErrors(errorObj);
      toast.error(errorObj.password);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      await axios.put(`${appConfig.baseURL}/user/profile/update`, {
        currentPassword,
        newPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // Wallet OTP Flow
  const sendUpdateOtp = async () => {
    setSendingOtp(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      await axios.post(`${appConfig.baseURL}/user/wallet/send-update-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("OTP sent to your registered email");
      setShowWalletModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const updateWalletAddress = async () => {
    if (!newWalletAddress || !otp) {
      toast.error("Wallet address and OTP are required");
      return;
    }

    setUpdatingWallet(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      await axios.post(`${appConfig.baseURL}/user/wallet/update-address`, {
        otp,
        walletAddress: newWalletAddress,
        remark: remark || "Updated via profile",
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Wallet address updated successfully!");
      setFormData((prev) => ({ ...prev, walletAddress: newWalletAddress }));
      setShowWalletModal(false);
      setNewWalletAddress("");
      setOtp("");
      setRemark("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wallet");
    } finally {
      setUpdatingWallet(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formData.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Wallet address copied!");
  };

  const isWalletSet = formData.walletAddress && 
                     formData.walletAddress !== "" && 
                     formData.walletAddress !== "NA" && 
                     formData.walletAddress.length > 10;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading profile...</div></div>;
  }

  return (
    <>
      <div className="theme-card-style border-gradient text-gray-800 p-5 rounded-md min-h-[80vh]">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {["Personal Details", "Password Details"].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx === 0 ? "personal" : "password")}
              className={`px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === (idx === 0 ? "personal" : "password")
                  ? "text-white border-b-2 border-blue-400 bg-gradient-to-b from-blue-700 to-blue-600 rounded-t"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===================== PERSONAL DETAILS ===================== */}
        {activeTab === "personal" && (
          <div className="space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0px_4px_15px_0px_#00000026] overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#D1D5DC] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-[#D1D5DC] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">Email Address</label>
                    <div className="relative">
                      <MdOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#364153] mb-1">Nationality</label>
                    <input type="text" value={formData.nationality} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#364153] mb-1">Address</label>
                    <div className="relative">
                      <SlLocationPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 flex justify-end gap-3 border-t">
                  <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg text-[#364153] hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] text-white rounded-lg hover:bg-blue-700 transition">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* KYC Verification Card - Dynamic */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">KYC Verification</h3>
                <p className="text-sm text-gray-500">Complete your verification to access all features</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <HiOutlineDocumentText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Government-Issued ID</h4>
                        <p className="text-sm text-gray-500">Passport, Driver's License, or National ID</p>
                      </div>
                    </div>

                    {kycStatus === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-green-50 text-green-600 font-medium">
                        <FiCheckCircle /> Verified
                      </span>
                    ) : kycStatus === "rejected" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-red-50 text-red-600 font-medium">
                        <FiAlertCircle /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-orange-50 text-orange-600 font-medium">
                        <FiAlertCircle /> Pending Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank & Wallet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bank Details (kept your old design) */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.08)] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-50">
                    <LuBuilding2 className="text-green-600 text-lg" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                </div>
                {/* Your old bank form here - you can paste it if needed */}
                <div className="text-center text-gray-500 py-10">Bank details coming soon...</div>
              </div>

              {/* Crypto Wallet - Old Design */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.08)] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <LuWallet className="text-lg" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Crypto Wallet Address</h3>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={formData.walletAddress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                  />
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-100">
                    <FaCopy /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <button
                  onClick={sendUpdateOtp}
                 disabled={sendingOtp || (formData.walletAddress && formData.walletAddress !== "NA")}
                 className={`mt-6 w-full py-3 text-white rounded-xl font-medium transition-all ${
                  formData.walletAddress && formData.walletAddress !== "NA"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#2460F5] to-[#3B1DDA] hover:bg-blue-700"
                }`}
                >
                {formData.walletAddress && formData.walletAddress !== "NA"
                  ? "Wallet Address Already Set"
                  : sendingOtp
                  ? "Sending OTP..."
                  : "Change Wallet Address"}
                </button>
                {formData.walletAddress && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  To change wallet address, please contact support
                </p>
              )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== PASSWORD DETAILS ===================== */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-6">
            {["currentPassword", "newPassword", "confirmPassword"].map((field, idx) => (
              <div className="relative" key={idx}>
                <label className="text-sm mb-1 font-bold flex items-center gap-2">
                  <FaKey className="text-sky-500" /> {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type={showPassword[field.replace("Password", "").toLowerCase()] ? "text" : "password"}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 pr-10"
                />
                <span
                  onClick={() => setShowPassword((prev) => ({
                    ...prev,
                    [field.replace("Password", "").toLowerCase()]: !prev[field.replace("Password", "").toLowerCase()],
                  }))}
                  className="absolute right-2 top-7 text-gray-500 cursor-pointer"
                >
                  {showPassword[field.replace("Password", "").toLowerCase()] ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            ))}
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 transition-colors text-white text-sm rounded"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {/* Wallet OTP Modal */}
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