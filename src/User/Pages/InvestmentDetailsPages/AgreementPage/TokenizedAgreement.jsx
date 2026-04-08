import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { appConfig } from "../../../../config/appConfig"; // Adjust path as needed

export default function TokenAgreementForm({ property }) {
  const sigRef = useRef();
  const companySigRef = useRef();

  const [form, setForm] = useState({
    date: "",
    investorName: "",
    passport: "",
    address: "",
    investmentAmount: "",
    tokenPrice: "",
    totalTokens: "",
    companyRep: "",
  });

  const [investorSignature, setInvestorSignature] = useState(null);
  const [companySignature, setCompanySignature] = useState(null);

  // Fetch KYC data
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ["kycData"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await axios.get(`${appConfig.baseURL}/user/get-kyc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data; // Assume structure { name, passport, address, etc. }
    },
  });

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setForm((p) => ({ ...p, date: today }));
  }, []);

  useEffect(() => {
    if (kycData) {
      setForm((p) => ({
        ...p,
        investorName: kycData.name || "",
        passport: kycData.passport || "",
        address: kycData.address || "",
      }));
    }
  }, [kycData]);

  useEffect(() => {
    if (property) {
      setForm((p) => ({
        ...p,
        investmentAmount: property.amount_usd || "",
        tokenPrice: property.token_price || "",
        totalTokens: property.tokens_bought || "",
      }));
    }
  }, [property]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const input =
    "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none";

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TOKENIZED PROPERTY INVESTMENT AGREEMENT", 105, 20, { align: "center" });

    // Add date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${form.date}`, 20, 40);

    // Add parties
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Parties", 20, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Company: URBAN RWA / URBANRWA", 20, 60);
    doc.text("White Cloud Solutions LLC", 20, 70);
    doc.text("N9 Richard Holbrook Street, 74A ISANI, Tbilisi, Georgia", 20, 80);

    doc.text(`Investor Name: ${form.investorName}`, 20, 90);
    doc.text(`Passport/ID: ${form.passport}`, 20, 100);
    doc.text(`Address: ${form.address}`, 20, 110);

    // Add purpose
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Purpose of Agreement", 20, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("The Investor invests in tokenized real estate assets listed on the platform and receives tokens representing fractional economic interest.", 20, 130, { maxWidth: 170 });

    // Add other sections similarly (abbreviated for brevity)
    // ... Add sections 3 to 13 as text ...

    // Add signatures
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("14. Signatures", 20, 250);
    if (investorSignature) {
      doc.addImage(investorSignature, "PNG", 20, 260, 80, 30);
    }
    if (companySignature) {
      doc.addImage(companySignature, "PNG", 110, 260, 80, 30);
    }

    doc.save(`Tokenized_Property_Agreement_${property.property_id}.pdf`);
  };

  if (kycLoading) return <div>Loading KYC data...</div>;

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-16 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-blue-700 to-secondary text-white p-8 rounded-t-2xl">
          <h1 className="text-3xl font-bold">
            TOKENIZED PROPERTY INVESTMENT AGREEMENT
          </h1>
          <p className="opacity-80 text-sm">
            Shagun Pro– Smart Property Investment Platform
          </p>
        </div>

        {/* BODY */}
        <div className="p-10 text-black leading-relaxed space-y-8">

          <p>
            This Agreement is entered into on{" "}
            <span className="font-semibold">{form.date}</span>.
          </p>

          {/* ================= 1 ================= */}
          <div>
            <h2 className="font-bold text-lg mb-4 border-b pb-2">1. Parties</h2>

            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <p className="font-semibold">Company</p>
              <p>Shagun Pro / URBANRWA</p>
              <p>White Cloud Solutions LLC</p>
              <p>N9 Richard Holbrook Street, 74A ISANI, Tbilisi, Georgia</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Investor Name</label>
                <input
                  name="investorName"
                  value={form.investorName}
                  onChange={handleChange}
                  className={input}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Passport / ID</label>
                <input
                  name="passport"
                  value={form.passport}
                  onChange={handleChange}
                  className={input}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={input}
                />
              </div>
            </div>
          </div>

          {/* ... (rest of the sections as in your code) ... */}

          {/* Signatures */}
          <div>
            <h2 className="font-bold text-lg mb-4 border-b pb-2">
              14. Signatures
            </h2>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Company */}
              <div className="border rounded-lg p-4">
                <p className="font-semibold mb-2">
                  For Shagun Pro / White Cloud Solutions LLC
                </p>

                <label className="text-sm font-medium">Representative Name</label>
                <input
                  name="companyRep"
                  value={form.companyRep}
                  onChange={handleChange}
                  className={input}
                />

                {!companySignature ? (
                  <>
                    <SignatureCanvas
                      ref={companySigRef}
                      penColor="black"
                      canvasProps={{
                        width: 300,
                        height: 120,
                        className: "border rounded bg-white mt-3",
                      }}
                    />
                    <button
                      onClick={() =>
                        setCompanySignature(
                          companySigRef.current.toDataURL()
                        )
                      }
                      className="mt-2 px-4 py-2 bg-gradient-to-br from-blue-700 to-secondary text-white rounded"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <img src={companySignature} alt="" className="h-20 mt-3" />
                )}

                <p className="mt-2 text-sm">Date: {form.date}</p>
              </div>

              {/* Investor */}
              <div className="border rounded-lg p-4">
                <p className="font-semibold mb-2">Investor</p>

                {!investorSignature ? (
                  <>
                    <SignatureCanvas
                      ref={sigRef}
                      penColor="black"
                      canvasProps={{
                        width: 300,
                        height: 120,
                        className: "border rounded bg-white",
                      }}
                    />
                    <button
                      onClick={() =>
                        setInvestorSignature(sigRef.current.toDataURL())
                      }
                      className="mt-2 px-4 py-2 bg-gradient-to-br from-blue-700 to-secondary text-white rounded"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <img src={investorSignature} alt="" className="h-20" />
                )}

                <p className="mt-2 text-sm">Date: {form.date}</p>
              </div>
            </div>
          </div>

          {/* Generate PDF Button */}
          <div className="text-center">
            <button
              onClick={generatePDF}
              className="px-6 py-3 bg-black text-white rounded-lg"
            >
              Download Agreement PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}