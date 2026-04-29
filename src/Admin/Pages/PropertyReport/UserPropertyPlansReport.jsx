import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight, FaCopy } from "react-icons/fa";

const InvestmentReport = () => {
  // Filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [userIdInput, setUserIdInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Modal state
  const [modalData, setModalData] = useState(null);

  const queryClient = useQueryClient();

  // Server-side pagination
  const { 
    data: apiResponse = { history: [], totalPages: 1, totalRecords: 0 }, 
    isFetching, 
    isError,
  } = useQuery({
    queryKey: ["adminInvestmentReport", pagination.pageIndex, userIdFilter, startDate, endDate],
    queryFn: async () => {
      const pageNum = pagination.pageIndex + 1;
      const res = await adminApi.getAllInvestments(
        pageNum, 
        pagination.pageSize, 
        startDate, 
        endDate, 
        userIdFilter
      );

      return {
        history: res?.data?.history || [],
        totalPages: res?.data?.totalPages || 1,
        totalRecords: res?.data?.totalRecords || 0,
      };
    },
    refetchOnWindowFocus: false,
  });

  const investments = apiResponse.history;
  const pageCount = apiResponse.totalPages;
  const totalRecords = apiResponse.totalRecords;
  const currentPage = pagination.pageIndex + 1;

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // ==================== FIXED HANDLE ACTION ====================
  const handleAction = async () => {
    if (!modalData) return;

    try {
      // This is the only API call now
      await adminApi.updateInvestmentStatus(
        modalData.id,
        modalData.action,           // "approve" or "disapprove"
        modalData.note.trim()
      );

      toast.success(
        modalData.action === "approve"
          ? "Investment approved successfully!"
          : "Investment rejected successfully!"
      );

      setModalData(null);
      queryClient.invalidateQueries({ queryKey: ["adminInvestmentReport"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const columns = useMemo(() => [
    { accessorKey: "sr", header: "S.No.", cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1 },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}` },
    { accessorKey: "sgnPriceAtInvestment", header: "SGN Price", cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(6)}` },
    { accessorKey: "totalReturn", header: "Total Return", cell: ({ getValue }) => Number(getValue() || 0).toFixed(6) },
    { accessorKey: "dailyIncome", header: "Daily Income", cell: ({ getValue }) => Number(getValue() || 0).toFixed(6) },
    { accessorKey: "claimedTokens", header: "Claimed Tokens", cell: ({ getValue }) => Number(getValue() || 0).toFixed(6) },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        const color = status === "active" ? "bg-green-800 text-green-300" 
                     : status === "completed" ? "bg-blue-800 text-blue-300" 
                     : "bg-red-800 text-red-300";
        return <span className={`px-3 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
      },
    },
  ], [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  const handleSearch = () => {
    setUserIdFilter(userIdInput.trim());
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  // Fetch ALL filtered records for export
  const fetchFullData = async () => {
    let all = [], page = 1, totalPages = 1;
    while (page <= totalPages) {
      const res = await adminApi.getAllInvestments(
        page,
        1000,
        startDate,
        endDate,
        userIdFilter
      );
      const data = res?.data || {};
      all = [...all, ...(data.history || [])];
      totalPages = data.totalPages || 1;
      page++;
    }
    return all;
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const allData = await fetchFullData();
      if (!allData.length) return toast.error("No data to export");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.text("Investment Report", 14, 15);

      const headers = [
        "S.No.", "User ID", "Amount", "SGN Price", "Total Return", "Daily Income", 
        "Claimed Tokens", "Start Date", "End Date", "Status"
      ];

      const rows = allData.map((item, idx) => [
        idx + 1,
        item.userId || "N/A",
        `$${Number(item.amount || 0).toFixed(2)}`,
        `$${Number(item.sgnPriceAtInvestment || 0).toFixed(6)}`,
        Number(item.totalReturn || 0).toFixed(6),
        Number(item.dailyIncome || 0).toFixed(6),
        Number(item.claimedTokens || 0).toFixed(6),
        item.startDate ? new Date(item.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
        item.endDate ? new Date(item.endDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
        item.status || "N/A",
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
      });

      doc.save("investment-report.pdf");
      toast.success("PDF exported successfully");
    } catch (err) {
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const allData = await fetchFullData();
      if (!allData.length) return toast.error("No data to export");

      const excelData = allData.map((item, idx) => ({
        "S.No.": idx + 1,
        "User ID": item.userId || "N/A",
        "Amount": `$${Number(item.amount || 0).toFixed(2)}`,
        "SGN Price": `$${Number(item.sgnPriceAtInvestment || 0).toFixed(6)}`,
        "Total Return": Number(item.totalReturn || 0).toFixed(6),
        "Daily Income": Number(item.dailyIncome || 0).toFixed(6),
        "Claimed Tokens": Number(item.claimedTokens || 0).toFixed(6),
        "Start Date": item.startDate 
          ? new Date(item.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) 
          : "N/A",
        "End Date": item.endDate 
          ? new Date(item.endDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) 
          : "N/A",
        "Status": item.status || "N/A",
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelData), "InvestmentReport");
      XLSX.writeFile(wb, "investment-report.xlsx");
      toast.success("Excel exported successfully");
    } catch (err) {
      toast.error("Failed to export Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isError) return <div className="p-4 text-red-600 text-center">Error loading investment data</div>;

  const startEntry = pagination.pageIndex * pagination.pageSize + 1;
  const endEntry = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRecords);

  return (
    <div className="p-4 max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">Investment Report</h2>

      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">User ID</label>
            <input 
              type="text" 
              value={userIdInput} 
              onChange={e => setUserIdInput(e.target.value)} 
              placeholder="SGN00001" 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103944]" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103944]" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103944]" 
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} className="w-full bg-[#103944] hover:bg-[#0e2a3d] text-white py-2.5 rounded-xl text-sm font-medium">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button onClick={handleExportPDF} disabled={isExportingPDF} 
          className={`flex-1 sm:flex-none flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-lg active:scale-95 ${isExportingPDF ? "opacity-60 cursor-not-allowed" : ""}`}>
          {isExportingPDF ? "⏳ Exporting PDF..." : "📄 Export PDF"}
        </button>
        <button onClick={handleExportExcel} disabled={isExportingExcel} 
          className={`flex-1 sm:flex-none flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow-lg active:scale-95 ${isExportingExcel ? "opacity-60 cursor-not-allowed" : ""}`}>
          {isExportingExcel ? "⏳ Exporting Excel..." : "📊 Export Excel"}
        </button>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto bg-white rounded-lg shadow border min-h-[400px]">
        {isFetching && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-[#103944] font-medium">
              <div className="w-5 h-5 border-4 border-[#103944] border-t-transparent rounded-full animate-spin" />
              Loading page {currentPage}...
            </div>
          </div>
        )}

        <table className="min-w-full text-sm">
          <thead className="bg-[#103944] text-white sticky top-0">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th key={header.id} className="p-3 text-left font-medium border-b whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {investments.length === 0 && !isFetching ? (
              <tr><td colSpan={13} className="p-12 text-center text-gray-500">No investment records found</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 border-b last:border-none">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-gray-600">
          Showing {startEntry} to {endEntry} of {totalRecords} entries
        </div>

        <div className="space-x-2 flex">
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))} disabled={pagination.pageIndex === 0 || isFetching}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed">First</button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(p.pageIndex - 1, 0) }))} disabled={pagination.pageIndex === 0 || isFetching}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"><FaAngleLeft /></button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))} disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"><FaAngleRight /></button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(pageCount - 1, 0) }))} disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed">Last</button>
        </div>
      </div>

      {/* ACTION MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b">
              <h3 className="text-xl font-semibold text-[#103944]">
                {modalData.action === "approve" ? "Approve Investment" : "Reject Investment"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Product ID: <span className="font-medium">{modalData.productId}</span>
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note / Reason <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={modalData.note}
                onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                placeholder="Enter reason or additional comments..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#103944]"
              />
            </div>

            <div className="flex border-t px-6 py-4 gap-3">
              <button
                onClick={() => setModalData(null)}
                className="flex-1 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 py-3 text-white font-medium rounded-xl transition ${
                  modalData.action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {modalData.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentReport;