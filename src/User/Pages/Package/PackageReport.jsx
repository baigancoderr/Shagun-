import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight, FaCopy } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import moment from "moment";
import { toast } from "react-toastify";
import SkeletonLoader from "../../Components/Comman/Skeletons";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../Contexts/DemoModeContext";
import { getDemoData } from "../../Data/demoData";
import { userApi } from "../../Service/userApi";

const columnHelper = createColumnHelper();

const InvestmentReport = () => {
  const { isDemoMode } = useDemoMode();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [productSearch, setProductSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tempProductSearch, setTempProductSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // ================= COPY TO CLIPBOARD =================
  const copyToClipboard = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard! 📋`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setProductSearch(tempProductSearch);
    setStatusFilter(tempStatus);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
  };

  // ================= API CALL (exact match to your userApi) =================
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["investments", currentPage, productSearch, statusFilter, startDate, endDate],
    queryFn: async () => {
      const result = await userApi.getUserInvestments(
        currentPage,
        rowsPerPage,
        startDate || undefined,
        endDate || undefined
      );

      if (result.status === "error") {
        throw new Error(result.message || "Failed to fetch investments");
      }

      return result.data || { investments: [], total: 0 };
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !isDemoMode,
  });

  const rawData = isDemoMode ? getDemoData("investmentReport") : data || {};

  const investments = rawData.investments || [];
  const total = rawData.total || 0;
  const totalPages = Math.ceil(total / rowsPerPage);

  const columns = useMemo(
    () => [
      {
        id: "sno",
        header: "Sr.",
        cell: ({ row }) => (currentPage - 1) * rowsPerPage + row.index + 1,
      },
      {
        accessorKey: "productId",
        header: "Product ID",
      },
      {
        accessorKey: "quantity",
        header: "QTY",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => `$${Number(info.getValue() ?? 0).toLocaleString()}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let className = "px-2 py-1 rounded text-xs font-semibold";
          if (status === "ACTIVE") className += " bg-green-800 text-green-300";
          else if (status === "PENDING") className += " bg-yellow-800 text-yellow-300";
          else if (status === "REJECTED") className += " bg-red-800 text-red-300";
          return <span className={className}>{status}</span>;
        },
      },
      {
        accessorKey: "transactionHash",
        header: "Transaction Hash",
        cell: (info) => {
          const hash = info.getValue();
          if (!hash) return "-";
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{hash.substring(0, 12)}...</span>
              <button
                onClick={() => copyToClipboard(hash, "Transaction Hash")}
                className="text-[#FF6000] hover:text-white transition-colors"
                title="Copy full hash"
              >
                <FaCopy size={14} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "walletAddress",
        header: "Wallet Address",
        cell: (info) => {
          const addr = info.getValue();
          if (!addr) return "-";
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{addr.substring(0, 12)}...</span>
              <button
                onClick={() => copyToClipboard(addr, "Wallet Address")}
                className="text-[#FF6000] hover:text-white transition-colors"
                title="Copy full address"
              >
                <FaCopy size={14} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
            : "N/A",
      },
    ],
    [currentPage]
  );

  const table = useReactTable({
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const exportToExcel = async () => {
    try {
      let allData;
      if (isDemoMode) {
        allData = investments;
      } else {
        const result = await userApi.getUserInvestments(
          1,
          total || 500,
          startDate || undefined,
          endDate || undefined
        );
        if (result.status === "error") throw new Error(result.message);
        allData = result.data?.investments || [];
      }

      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "InvestmentReport");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "investment-report.xlsx");
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Export failed: " + err.message);
    }
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-[#FF6000] font-bold">Investment Report</h2>
        <button
          onClick={exportToExcel}
          disabled={isLoading || investments.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-transparent hover:bg-[#ff6000] transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm font-medium text-white mb-1 block">Product ID</label>
          <input
            type="text"
            value={tempProductSearch}
            onChange={(e) => setTempProductSearch(e.target.value)}
            placeholder="Search Product ID..."
            className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded focus:outline-none focus:border-[#FF6000]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Status</label>
          <select
            value={tempStatus}
            onChange={(e) => setTempStatus(e.target.value)}
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF6000]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Start Date</label>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF6000] [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">End Date</label>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF6000] [color-scheme:dark]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-[#FF6000] text-white rounded hover:bg-[#E3090D] transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {isFetching && !isLoading && (
        <div className="text-center py-4 text-white font-medium">Loading next page...</div>
      )}

      {isError ? (
        <p className="text-center text-red-500 py-8">{error?.message}</p>
      ) : isLoading ? (
        <SkeletonLoader variant="table" rows={8} />
      ) : (
        <>
          <div className="overflow-auto rounded">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-transparent">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-gray-200 text-[#ff6000] text-nowrap"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 border-b border-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {table.getRowModel().rows.length === 0 && (
              <p className="text-center text-white py-8">No data found.</p>
            )}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
            <div>
              Page <span className="font-semibold">{currentPage}</span> of {totalPages} 
              ({total} records)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentReport;