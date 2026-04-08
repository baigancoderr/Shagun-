import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { appConfig } from "../../../config/appConfig";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

const PINATA_JWT = appConfig.PINATA_JWT;

const KycSubmitPage = () => {
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    firstNameAsPerID: "",
    lastNameAsPerID: "",
    DateOfBirth: "",
    Address: "",
    governmentIdType: "",
    governmentIdNumber: "",
  });

  const [files, setFiles] = useState({
    governmentIdFront: null,
    governmentIdBack: null,
    signatureImage: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    governmentIdFront: null,
    governmentIdBack: null,
    signatureImage: null,
  });

  // Pinata V3 Upload Helper (Client-side)
  const uploadToPinata = async (file, isDocument = false) => {
    try {
      const formDataPinata = new FormData();
      formDataPinata.append("file", file);
      formDataPinata.append("name", file.name);
      formDataPinata.append("network", "public");

      const res = await fetch("https://uploads.pinata.cloud/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formDataPinata,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      const json = await res.json();
      const cid = json.data.cid;
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      return isDocument
        ? { name: file.name, type: file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC", link: url }
        : url;
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
  };

  // File Validation + Preview
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    if (file.size > MAX_SIZE) {
      toast.error("File size must not exceed 10 MB");
      e.target.value = "";
      return;
    }

    let allowedTypes = [];
    if (type === "governmentIdFront" || type === "governmentIdBack") {
      allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    } else if (type === "signatureImage") {
      allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `Only ${type.includes("signature") ? "JPG, PNG" : "JPG, PNG, PDF"} files allowed`
      );
      e.target.value = "";
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: file }));
    const reader = new FileReader();
    reader.onload = () => setPreviewUrls((prev) => ({ ...prev, [type]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchMyKYC();
  }, []);

  const fetchMyKYC = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await axios.get(`${appConfig.baseURL}/user/get-kyc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycData(res.data.data?.kyc || null);
    } catch (error) {
      console.error("Failed to fetch KYC", error);
      setKycData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitKYC = async () => {
    if (!formData.firstNameAsPerID || !formData.lastNameAsPerID || !formData.DateOfBirth || 
        !formData.governmentIdNumber || !formData.governmentIdType) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!files.governmentIdFront || !files.signatureImage) {
      toast.error("Government ID Front and Signature Image are required");
      return;
    }

    setSubmitting(true);

    try {
      const uploadFront = files.governmentIdFront 
        ? uploadToPinata(files.governmentIdFront) 
        : Promise.resolve(null);
      
      const uploadBack = files.governmentIdBack 
        ? uploadToPinata(files.governmentIdBack) 
        : Promise.resolve(null);
      
      const uploadSig = files.signatureImage 
        ? uploadToPinata(files.signatureImage) 
        : Promise.resolve(null);

      const [frontUrl, backUrl, sigUrl] = await Promise.all([uploadFront, uploadBack, uploadSig]);

      if ((files.governmentIdFront && !frontUrl) || 
          (files.signatureImage && !sigUrl)) {
        return;
      }

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      const payload = {
        firstNameAsPerID: formData.firstNameAsPerID,
        lastNameAsPerID: formData.lastNameAsPerID,
        DateOfBirth: formData.DateOfBirth,
        Address: formData.Address,
        governmentIdType: formData.governmentIdType,
        governmentIdNumber: formData.governmentIdNumber,
        governmentIdFront: frontUrl,
        governmentIdBack: backUrl,
        signatureImage: sigUrl,
      };

      const res = await axios.post(`${appConfig.baseURL}/user/submit-kyc`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("KYC submitted successfully! Waiting for admin approval.");
      fetchMyKYC();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading KYC status...</div>;

  if (kycData && kycData.status !== "rejected") {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[#FF6000]">KYC Status</h2>
        <div className="bg-white rounded-2xl shadow p-8 max-w-2xl mx-auto text-center">
          {kycData.status === "approved" ? (
            <FaCheckCircle className="text-green-500 text-8xl mx-auto mb-4" />
          ) : (
            <FaSpinner className="text-[#E3090D] text-8xl mx-auto mb-4 animate-spin" />
          )}
          <h3 className="text-2xl font-semibold text-[#FF6000]">
            {kycData.status === "approved" ? "✅ KYC Approved" : "⏳ KYC Under Review"}
          </h3>
          <p className="text-black mt-2">
            {kycData.status === "approved"
              ? "Your KYC has been successfully verified by admin."
              : "Your KYC is under review. You will be notified once approved."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1260px] mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#FF6000]">
        {kycData?.status === "rejected" ? "Re-Submit KYC" : "Submit KYC"}
      </h2>

      <div className="bg-black rounded-2xl shadow p-4 md:p-8 max-w-2xl mx-auto border border-[#FF6000]">
        <h3 className="text-xl font-semibold mb-6 text-white">Personal & Government ID Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">First Name (as per ID) <span className="text-red-500">*</span></label>
<input
  type="text"
  name="firstNameAsPerID"
  value={formData.firstNameAsPerID}
  onChange={handleChange}
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000]"
  placeholder="Enter first name"
/>          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Last Name (as per ID) <span className="text-red-500">*</span></label>
<input
  type="text"
  name="lastNameAsPerID"
  value={formData.lastNameAsPerID}
  onChange={handleChange}
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000]"
  placeholder="Enter last name"
/>          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Date of Birth <span className="text-red-500">*</span></label>
<input
  type="date"
  name="DateOfBirth"
  value={formData.DateOfBirth}
  onChange={handleChange}
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
  style={{ colorScheme: "dark" }}
/>          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-1">Full Address (as per ID)</label>
<textarea
  name="Address"
  value={formData.Address}
  onChange={handleChange}
  rows="3"
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] resize-none"
  placeholder="Enter full address as per ID"
/>          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Government ID Type <span className="text-red-500">*</span></label>
          <div className="relative">
  <select
    name="governmentIdType"
    value={formData.governmentIdType}
    onChange={handleChange}
    className="w-full border border-gray-400 text-white rounded px-4 py-3 pr-10 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] appearance-none"
  >
    <option value="" className="bg-[#111111] text-white">Select ID Type</option>
    <option value="Government_ID" className="bg-[#111111] text-white">Government ID</option>
    <option value="Passport" className="bg-[#111111] text-white">Passport</option>
    <option value="DrivingLicense" className="bg-[#111111] text-white">Driving License</option>
  </select>

  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#FF6000]">
    ▼
  </div>
</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Government ID Number <span className="text-red-500">*</span></label>
<input
  type="text"
  name="governmentIdNumber"
  value={formData.governmentIdNumber}
  onChange={handleChange}
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] placeholder:text-gray-400"
  placeholder="Enter ID number"
/>          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-1">Upload Government ID Front <span className="text-red-500">*</span> (JPG, PNG, PDF • Max 10 MB)</label>
<input
  type="file"
  accept="image/*,.pdf"
  onChange={(e) => handleFileChange(e, "governmentIdFront")}
  className="w-full border border-gray-400 text-white rounded px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] file:mr-4 file:rounded-md file:border-0 file:bg-[#FF6000] file:px-4 file:py-2 file:text-white file:cursor-pointer hover:file:bg-[#ff7a26]"
/>            {previewUrls.governmentIdFront && <img src={previewUrls.governmentIdFront} alt="ID Front" className="mt-3 max-h-48 rounded border" />}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-1">Upload Government ID Back (Optional) (JPG, PNG, PDF • Max 10 MB)</label>
<input
  type="file"
  accept="image/*,.pdf"
  onChange={(e) => handleFileChange(e, "governmentIdBack")}
  className="w-full border border-gray-400 text-white rounded-lg px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] file:mr-4 file:rounded-lg file:border file:border-[#FF6000] file:bg-gradient-to-r file:from-[#FF6000] file:to-[#ff7a26] file:px-4 file:py-2 file:text-white file:font-medium file:cursor-pointer file:transition-all "
/>            {previewUrls.governmentIdBack && <img src={previewUrls.governmentIdBack} alt="ID Back" className="mt-3 max-h-48 rounded border" />}
          </div>

          {/* Signature Upload with Note */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-1">
              Upload Signature Image <span className="text-red-500">*</span> (JPG, PNG • Max 10 MB)
            </label>
           <input
  type="file"
  accept="image/*"
  onChange={(e) => handleFileChange(e, "signatureImage")}
  className="w-full border border-gray-400 text-white rounded-lg px-4 py-3 bg-transparent transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] file:mr-4 file:rounded-lg file:border file:border-[#FF6000] file:bg-gradient-to-r file:from-[#FF6000] file:to-[#ff7a26] file:px-4 file:py-2 file:text-white file:font-medium file:cursor-pointer file:transition-all "
/>
            {previewUrls.signatureImage && (
              <img src={previewUrls.signatureImage} alt="Signature Preview" className="mt-3 max-h-48 rounded border" />
            )}
            
            {/* Added Note */}
            <p className="text-xs text-gray-500 mt-2 italic">
              Please upload signature to remove background or clear background from signature image for better verification.
            </p>
          </div>
        </div>

        <button
  onClick={handleSubmitKYC}
  disabled={submitting}
  className="w-full mt-10 bg-gradient-to-r from-[#FF6000] to-[#E3090D] hover:from-[#ff7a1a] hover:to-[#ff3b3f] text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(255,96,0,0.35)] active:scale-[0.98]"
>
  {submitting ? <FaSpinner className="animate-spin" /> : "Submit KYC"}
</button>
      </div>
    </div>
  );
};

export default KycSubmitPage;