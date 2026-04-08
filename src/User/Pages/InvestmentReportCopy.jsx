import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../Contexts/DemoModeContext";
import { getDemoData } from "../Data/demoData";

const columnHelper = createColumnHelper();

const generateAgreementHTML = (rowData, kycData) => {
  console.log("row data ",rowData);
  const agreementDate = moment().format("MMMM Do, YYYY");
  const investorName = `${kycData.firstNameAsPerID || "______________________________"} ${kycData.lastNameAsPerID || ""}`;

  const companySignatureUrl =
    "https://apricot-wooden-earthworm-457.mypinata.cloud/ipfs/bafkreidf45laludtatbk6icbvf3oxbod2abav27x5ftavywxtwsd7fz2dq?pinataGatewayToken=GsL6a0yw4PeuW2mm6sSk3OHzegwekzBpIFHx_ApY_XV7KujGTtDOVUBQPT7WS2KB";

  const investorSignatureUrl = kycData.signatureImage || "";

  const companyLogoUrl =
    "https://apricot-wooden-earthworm-457.mypinata.cloud/ipfs/bafkreifesqjoblvefkmw47dpz7uqfcz5qlnpc3fnw75m5ip7woi4o7tvym?pinataGatewayToken=GsL6a0yw4PeuW2mm6sSk3OHzegwekzBpIFHx_ApY_XV7KujGTtDOVUBQPT7WS2KB";

  const bgWatermark = "https://www.transparenttextures.com/patterns/cubes.png";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tokenized Property Investment Agreement</title>
<style>
  @page {
    size: A4 portrait;
    margin: 20mm;
    @bottom-left {
      content: "Confidential - For Internal Use Only";
      vertical-align: top;
      padding-top: 4mm;
      font-size: 8pt;
      font-family: 'Times New Roman', Times, serif;
      color: #666;
    }
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      vertical-align: top;
      padding-top: 4mm;
      font-size: 8pt;
      font-family: 'Times New Roman', Times, serif;
      color: #666;
    }
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    margin: 0;
    padding: 20px;
    background: #ffffff;
    color: #333333;
    line-height: 1.5;
  }

  .container {
    max-width: 170mm;
    margin: 0 auto;
    background: #ffffff;
    padding: 20mm;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transform: perspective(1000px) rotateX(2deg);
  }

  .container::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("${bgWatermark}");
    opacity: 0.04;
    pointer-events: none;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .logo {
    width: 120px;
    height: auto;
  }

  h1 {
    font-size: 20pt;
    margin: 0;
    color: #333333;
    text-align: center;
    flex: 1;
  }

  .agreement-date {
    font-size: 12pt;
    color: #666666;
    white-space: nowrap;
  }

  h2 {
    font-size: 14pt;
    color: #2563eb;
    margin-top: 30px;
    padding-bottom: 5px;
    border-bottom: 1px solid #2563eb;
    transition: transform 0.3s ease;
  }

  h2:hover {
    transform: translateX(3px);
  }

  p {
    margin: 10px 0;
    text-align: justify;
  }

  ul {
    margin-left: 20px;
    list-style-type: disc;
  }

  li {
    margin-bottom: 8px;
  }

  .bold {
    font-weight: bold;
  }

  hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #2563eb, transparent);
    margin: 25px 0;
  }

  .party-grid {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .party-box {
    flex: 1;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }

  .party-title {
    font-weight: bold;
    color: #2563eb;
    margin-bottom: 8px;
  }

  .signature-section {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 50px;
    page-break-inside: avoid;
  }

  .signature-box {
    width: 48%;
    text-align: center;
  }

  .signature-placeholder {
    height: 80px;
    border: 1px solid #cccccc;
    background: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999999;
    font-size: 10pt;
    border-radius: 4px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }

  .signature-img {
    height: 100px;
    width: auto;
    max-width: 100%;
    border: 1px solid #cccccc;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .sign-line {
    margin-top: 15px;
    border-top: 1px solid #333333;
    padding-top: 5px;
    font-size: 11pt;
  }

  .print-button {
    display: block;
    margin: 40px auto 0;
    padding: 10px 20px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12pt;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    transition: transform 0.2s;
  }

  .print-button:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    .party-grid, .signature-section {
      flex-direction: column;
    }
    .party-box, .signature-box {
      width: 100%;
      margin-bottom: 20px;
    }
    .header {
      flex-direction: column;
      text-align: center;
    }
    .logo, .agreement-date {
      margin-bottom: 10px;
    }
  }

  @media print {
    body {
      background: none;
      padding: 0;
    }
    .container {
      max-width: 100%;
      box-shadow: none;
      transform: none;
      padding: 0;
      border-radius: 0;
    }
    .print-button {
      display: none;
    }
    hr {
      page-break-after: avoid;
    }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="${companyLogoUrl}" class="logo" alt="Company Logo" />
    <h1>TOKENIZED PROPERTY INVESTMENT AGREEMENT</h1>
    <span class="agreement-date">${agreementDate}</span>
  </div>

  <p>(URBAN RWA – Smart Property Investment Platform)</p>
  <p>This Tokenized Property Investment Agreement is entered into on <span class="bold">${rowData.createdAt}</span></p>

  <hr>

  <h2>1. Parties</h2>
  <div class="party-grid">
    <div class="party-box">
      <div class="party-title">Company</div>
      <p><span class="bold">URBAN RWA / URBANRWA</span></p>
      <p>operated by White Cloud Solutions LLC</p>
      <p>Office Address:</p>
      <p>N9 Richard Holbrook Street</p>
      <p>74A ISANI, Tbilisi, Georgia</p>
      <p>(hereinafter referred to as “URBANRWA” or “Platform”)</p>
    </div>
    <div class="party-box">
      <div class="party-title">Investor</div>
      <p><span class="bold">Name:</span> ${investorName}</p>
      <p><span class="bold">Passport / ID No.:</span> ${kycData.governmentIdNumber || "___________________"}</p>
      <p><span class="bold">Address:</span> ${kycData.addressAsPerID || "___________________"}</p>
      <p>(hereinafter referred to as “Investor”)</p>
    </div>
  </div>

  <hr>

  <h2>2. Purpose of Agreement</h2>
  <p>This Agreement defines the terms under which the Investor invests in tokenized real estate assets listed on the URBANRWA platform and receives digital property tokens representing a fractional economic interest in the underlying property.</p>

  <hr>

  <h2>3. Nature of Tokenized Property</h2>
  <p>3.1 Each token represents a fractional economic interest in a specific real estate asset.</p>
  <p>3.2 Tokens do not represent direct physical ownership of the property unless specifically stated.</p>
  <p>3.3 Legal ownership of the property remains with the property holding entity / SPV / owner.</p>

  <hr>

  <h2>4. Investment Details</h2>
  <ul>
    <li><span class="bold">Investment Amount:</span> USD $${rowData.amountUsd || "__________"}</li>
    <li><span class="bold">Token Price:</span> USD $${Number(rowData.token_price || 0).toFixed(4)} per token</li>
    <li><span class="bold">Total Tokens Issued:</span> ${Number(rowData.tokens_bought || 0).toFixed(4)} Tokens</li>
    <li><span class="bold">Total Area Bought:</span> ${Number(rowData.unitsBought || 0).toFixed(4)} SQFT</li>
    <li><span class="bold">Rate:</span> ${Number(rowData.property_per_sqft_price || 0).toFixed(4)} SQFT </li>
  </ul>
  <p>Tokens shall be credited to the Investor’s URBANRWA account wallet after successful payment confirmation.</p>

  <hr>

  <h2>5. Monthly Returns</h2>
  <p>5.1 The Investor shall be eligible for monthly returns generated from the underlying property.</p>
  <p>5.2 Monthly returns may include:</p>
  <ul>
    <li>Rental income</li>
    <li>Operational profit share</li>
    <li>Other property-based income</li>
  </ul>
  <p>5.3 Monthly returns shall be credited to the Investor’s URBANRWA wallet or designated payout method, as per platform policy.</p>

  <hr>

  <h2>6. Lock-In Period</h2>
  <p>6.1 The investment shall have a lock-in period of 25 (Twenty-Five) months from the date of token allocation.</p>
  <p>6.2 During the lock-in period, tokens cannot be withdrawn or redeemed except as permitted under platform policies.</p>
  <p>6.3 After completion of the lock-in period, the Investor may:</p>
  <ul>
    <li>Continue holding tokens, or</li>
    <li>Exit as per URBANRWA exit mechanisms or secondary market availability.</li>
  </ul>

  <hr>

  <h2>7. Platform Responsibilities</h2>
  <p>URBANRWA shall:</p>
  <ul>
    <li>Manage token issuance and records</li>
    <li>Provide investor dashboard & reporting</li>
    <li>Facilitate monthly return distribution</li>
    <li>Ensure transparency of listed properties</li>
  </ul>

  <hr>

  <h2>8. Investor Declarations</h2>
  <p>The Investor confirms that:</p>
  <ul>
    <li>Investment funds are legally sourced</li>
    <li>The Investor understands tokenized real estate investments</li>
    <li>The investment is made voluntarily</li>
    <li>All platform information has been reviewed before investing</li>
  </ul>

  <hr>

  <h2>9. Compliance & KYC</h2>
  <p>The Investor agrees to complete all required KYC / AML procedures as per applicable laws.</p>
  <p>Failure to comply may result in suspension or restriction of account access.</p>

  <hr>

  <h2>10. Confidentiality</h2>
  <p>All business, financial, and platform information shall remain confidential unless disclosure is required by law.</p>

  <hr>

  <h2>11. Governing Law & Jurisdiction</h2>
  <p>This Agreement shall be governed by and construed in accordance with the laws of Georgia, and courts of Georgia shall have exclusive jurisdiction.</p>

  <hr>

  <h2>12. Termination</h2>
  <p>This Agreement may be terminated:</p>
  <ul>
    <li>Upon completion of the investment term</li>
    <li>By mutual consent</li>
    <li>In case of regulatory or legal requirements</li>
    <li>In case of fraud or material breach</li>
  </ul>

  <hr>

  <h2>13. Entire Agreement</h2>
  <p>This Agreement constitutes the entire understanding between URBANRWA and the Investor and supersedes all prior discussions or representations.</p>

  <hr>

  <h2>14. Signatures</h2>
  <div class="signature-section">
    <div class="signature-box">
      <p class="bold">For URBAN RWA</p>
      <img src="${companySignatureUrl}" class="signature-img" alt="Company Signature" />
      <div class="sign-line">Name: __________________________<br>Title: Authorized Signatory<br>Date: ${agreementDate}</div>
    </div>
    <div class="signature-box">
      <p class="bold">Investor</p>
      ${
        investorSignatureUrl
          ? `<img src="${investorSignatureUrl}" class="signature-img" alt="Investor Signature" />`
          : `<div class="signature-placeholder">Signature</div>`
      }
      <div class="sign-line">Name: ${investorName}<br>Date: ${agreementDate}</div>
    </div>
  </div>

  <button class="print-button" onclick="window.print()">Print Agreement</button>
</div>
</body>
</html>
`;
};

const InvestmentReport = () => {
  const { isDemoMode } = useDemoMode();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  const [tempStatus, setTempStatus] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [tempPropertySearch, setTempPropertySearch] = useState("");

  const [loadingIds, setLoadingIds] = useState([]);

  // 🔹 Fetch investments (cached by React Query)
  const fetchInvestments = async () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token)
      throw new Error("No authentication token found. Please log in.");

    let url = `${appConfig.baseURL}/user/investments?page=${currentPage}&limit=${pageSize}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (propertySearch) url += `&propertyId=${propertySearch}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const apiPlans = response.data.data.investments || []; // Adjust based on actual response structure

    return {
      investments: apiPlans.map((plan) => ({
        id: plan._id, // Changed to _id as per JSON
        propertyId: plan.property_id,
        investment_type: plan.investment_type,
        amountUsd: plan.amount_usd,
        unitsBought: plan.units_bought,
        property_per_sqft_price: plan.property_per_sqft_price,
        rental_Percentage: plan.rental_Percentage,
        tokens_bought: plan.tokens_bought,
        token_price: plan.token_price,
        status: plan.status,
        createdAt: moment(plan.createdAt)
          .utcOffset(330)
          .format("YYYY-MM-DD HH:mm:ss"),
      })),
      total: response.data.data.total || 0,
    };
  };

  const {
    data = { investments: [], total: 0 },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "investments",
      currentPage,
      pageSize,
      statusFilter,
      startDate,
      endDate,
      propertySearch,
    ],
    queryFn: fetchInvestments,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !isDemoMode, // Disable API call in demo mode
  });

  const fetchKycData = async () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      throw new Error("No token");
    }

    try {
      const response = await axios.get(`${appConfig.baseURL}/user/get-kyc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data; // Assuming structure like { firstNameAsPerID, lastNameAsPerID, dateOfBirthAsPerID, addressAsPerID, signatureImage, ... }
    } catch (err) {
      toast.error("Failed to fetch KYC data: " + err.message);
      throw err;
    }
  };

  const {
    data: kycData,
    isLoading: kycLoading,
    isError: kycError,
  } = useQuery({
    queryKey: ["kyc"],
    queryFn: fetchKycData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !isDemoMode,
  });

  useEffect(() => {
    if (kycError) {
      toast.error("Failed to fetch KYC data.");
    }
  }, [kycError]);

  // Use demo data if demo mode is active (client-side filtering for demo)
  const demoData = getDemoData("investmentReport");
  const filteredDemoData = useMemo(() => {
    let filtered = demoData;
    if (statusFilter)
      filtered = filtered.filter((row) => row.status === statusFilter);
    if (startDate)
      filtered = filtered.filter((row) =>
        moment(row.createdAt).isSameOrAfter(moment(startDate)),
      );
    if (endDate)
      filtered = filtered.filter((row) =>
        moment(row.createdAt).isSameOrBefore(moment(endDate).endOf("day")),
      );
    if (propertySearch)
      filtered = filtered.filter((row) => row.propertyId === propertySearch);

    const startIndex = (currentPage - 1) * pageSize;
    return {
      investments: filtered.slice(startIndex, startIndex + pageSize),
      total: filtered.length,
    };
  }, [
    demoData,
    currentPage,
    pageSize,
    statusFilter,
    startDate,
    endDate,
    propertySearch,
  ]);

  const displayData = isDemoMode ? filteredDemoData : data;
  const totalPages = Math.ceil(displayData.total / pageSize);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      tempStartDate &&
      tempEndDate &&
      moment(tempStartDate).isAfter(tempEndDate)
    ) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    setStatusFilter(tempStatus);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPropertySearch(tempPropertySearch);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const downloadAgreement = (rowData) => {
    if (isDemoMode) {
      toast.info("Agreement download is disabled in demo mode.");
      return;
    }

    if (rowData.tokens_bought <= 0) {
      toast.info("No tokens bought for this investment.");
      return;
    }

    if (kycLoading) {
      toast.info("Loading KYC data...");
      return;
    }

    if (kycError || !kycData) {
      toast.error("Failed to load KYC data.");
      return;
    }

    const id = rowData.id;
    if (loadingIds.includes(id)) return;

    setLoadingIds((prev) => [...prev, id]);
    try {
      const html = generateAgreementHTML(rowData, kycData.kyc);
      const newWindow = window.open("", "_blank");
      newWindow.document.write(html);
      newWindow.document.close();
      toast.success("Agreement opened successfully!");
    } catch (err) {
      console.error("HTML generation error:", err);
      toast.error("Failed to open agreement: " + err.message);
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const columns = [
    {
      id: "sno",
      header: "S.No",
      cell: ({ row }) => (
        <div className="text-left text-sm text-secondary">
          {row.index + 1 + (currentPage - 1) * pageSize}
        </div>
      ),
    },
    columnHelper.accessor("propertyId", { header: "Property ID" }),
    columnHelper.accessor("investment_type", { header: "Investment Type" }),
    columnHelper.accessor("amountUsd", {
      header: "Amount USD",
      cell: (info) => `$${info.getValue()}`,
    }),
    columnHelper.accessor("unitsBought", { header: "Area Bought (sqft)" }),
    columnHelper.accessor("property_per_sqft_price", {
      header: "Per Sqft Price (USD)",
      cell: (info) => `$${info.getValue()}`,
    }),
    columnHelper.accessor("rental_Percentage", {
      header: "Rental / Stake",
      cell: (info) => `${info.getValue()}%`,
    }),
    columnHelper.accessor("tokens_bought", {
      header: "Tokens Bought",
      cell: (info) => Number(info.getValue() || 0).toFixed(4),
    }),
    columnHelper.accessor("token_price", {
      header: "Token Price",
      cell: (info) => `$${Number(info.getValue() || 0).toFixed(4)}`,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            info.getValue() === "ACTIVE"
              ? "bg-green-800 text-green-300"
              : "bg-red-800 text-red-300"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", { header: "Created At" }),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.tokens_bought > 0 ? (
          <button
            onClick={() => downloadAgreement(row.original)}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            disabled={kycLoading || loadingIds.includes(row.original.id)}
          >
            {loadingIds.includes(row.original.id)
              ? "Opening..."
              : "View Agreement"}
          </button>
        ) : null,
    },
  ];

  const table = useReactTable({
    data: displayData.investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Server-side pagination
    pageCount: totalPages,
  });

  const exportToExcel = async () => {
    try {
      let allInvestments;
      if (isDemoMode) {
        let filtered = demoData;
        if (statusFilter)
          filtered = filtered.filter((row) => row.status === statusFilter);
        if (startDate)
          filtered = filtered.filter((row) =>
            moment(row.createdAt).isSameOrAfter(moment(startDate)),
          );
        if (endDate)
          filtered = filtered.filter((row) =>
            moment(row.createdAt).isSameOrBefore(moment(endDate).endOf("day")),
          );
        if (propertySearch)
          filtered = filtered.filter(
            (row) => row.propertyId === propertySearch,
          );
        allInvestments = filtered;
      } else {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        if (!token) {
          toast.error("No authentication token found. Please log in.");
          return;
        }
        let url = `${appConfig.baseURL}/user/investments?limit=${displayData.total}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (propertySearch) url += `&propertyId=${propertySearch}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allInvestments = response.data.data.investments.map((plan) => ({
          id: plan._id,
          propertyId: plan.property_id,
          investment_type: plan.investment_type,
          amountUsd: plan.amount_usd,
          unitsBought: plan.units_bought,
          property_per_sqft_price: plan.property_per_sqft_price,
          rental_Percentage: plan.rental_Percentage,
          tokens_bought: plan.tokens_bought,
          token_price: plan.token_price,
          status: plan.status,
          createdAt: moment(plan.createdAt)
            .utcOffset(330)
            .format("YYYY-MM-DD HH:mm:ss"),
        }));
      }

      if (allInvestments.length === 0) {
        toast.info("No data to export.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(allInvestments);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "InvestmentReport");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(dataBlob, "investment-report.xlsx");
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Failed to export: " + err.message);
    }
  };

  return (
    <>
      <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
        <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
          <h2 className="text-2xl font-bold">Property Investment Report</h2>
          <button
            onClick={exportToExcel}
            className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition"
          >
            <PiMicrosoftExcelLogo className="text-green-600" />
            <span>Export</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <input
            type="text"
            value={tempPropertySearch}
            onChange={(e) => setTempPropertySearch(e.target.value)}
            placeholder="Search property ID..."
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
          />
          <select
            value={tempStatus}
            onChange={(e) => setTempStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            {/* Add other statuses if available */}
          </select>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            placeholder="Start Date"
            className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
          />
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            placeholder="End Date"
            className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => {
              setTempStatus("");
              setTempStartDate("");
              setTempEndDate("");
              setTempPropertySearch("");
              setStatusFilter("");
              setStartDate("");
              setEndDate("");
              setPropertySearch("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </form>

        <div className="overflow-auto rounded">
          <table className="w-full border-collapse text-sm">
            {isLoading && !isDemoMode ? (
              <SkeletonLoader variant="table" />
            ) : isError && !isDemoMode ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              <>
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left px-4 py-2 border-b border-gray-200 text-nowrap"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition text-nowrap"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 border-b border-gray-200"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>

          {table.getRowModel().rows.length === 0 && !isLoading && (
            <p className="text-center text-sm text-gray-500 mt-4">
              No data found.
            </p>
          )}
        </div>

        <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
          <div>
            Page {currentPage} of {totalPages || 1}
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <div className="space-x-2 flex">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaAngleLeft />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestmentReport;
