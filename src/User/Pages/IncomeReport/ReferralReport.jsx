import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { appConfig } from "../../../config/appConfig";
import SkeletonLoader from "../../Components/Comman/Skeletons";
import { useDemoMode } from '../../Contexts/DemoModeContext';
import { getDemoData } from '../../Data/demoData';

const columnHelper = createColumnHelper();

const ReferralHistory = () => {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tempSearch, setTempSearch] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["referralHistory", search, startDate, endDate, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", currentPage.toString());
      params.append("limit", rowsPerPage.toString());

      const response = await fetch(
        `${appConfig.baseURL}/user/referral-income?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/user/login");
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch referral income data");
      }

      const result = await response.json();
      return result.data;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !isDemoMode,
  });

  const rawData = isDemoMode ? getDemoData("referralHistory") : data || {};

  const referrals = rawData.referrals || [];
  const pagination = rawData.pagination || { total: 0, page: 1, totalPages: 1 };
  const selfInvestment = rawData.selfInvestment || 0;
  const teamInvestment = rawData.teamInvestment || 0;
  const referralCount = rawData.referralCount || 0;
  const totalReferralIncome = rawData.totalReferralIncome || 0;

  const columns = useMemo(
    () => [
      {
        id: "sno",
        header: "Sr.",
        cell: ({ row }) => (currentPage - 1) * rowsPerPage + row.index + 1,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
            : "N/A",
      },
      {
        accessorKey: "referredId",
        header: "From",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        accessorKey: "investmentAmount",
        header: "Invested Amt",
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: (info) => `Level ${info.getValue()}`,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              info.getValue() === "completed"
                ? "bg-green-800 text-green-300"
                : "bg-yellow-800 text-yellow-300"
            }`}
          >
            {info.getValue() || "N/A"}
          </span>
        ),
      },
    ],
    [currentPage]
  );

  const table = useReactTable({
    data: referrals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(referrals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReferralHistory");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "referral-history.xlsx");
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-[#FF6000] font-bold">Referral History</h2>
        <button
          onClick={exportToExcel}
          disabled={isLoading || referrals.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-transparent hover:bg-[#ff6000] transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-8 mb-6 bg-transparent p-4 rounded border flex-wrap">
       
        <div>
          <p className="text-sm text-white">Referral Count</p>
          <p className="text-2xl font-semibold text-[#FF6000]">{referralCount}</p>
        </div>
        <div>
          <p className="text-sm text-white">Total Referral Income</p>
          <p className="text-2xl font-semibold text-[#FF6000]">${totalReferralIncome}</p>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm font-medium text-white mb-1 block">Search</label>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            placeholder="Search name / ID..."
            className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000]"
          />
        </div>

       <div>
  <label className="text-sm font-medium text-white mb-1 block">
    Start Date
  </label>
  <input
    type="date"
    value={tempStartDate}
    onChange={(e) => setTempStartDate(e.target.value)}
    className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
    style={{ colorScheme: "dark" }}
  />
</div>

        <div>
  <label className="text-sm font-medium text-white mb-1 block">
    End Date
  </label>
  <input
    type="date"
    value={tempEndDate}
    onChange={(e) => setTempEndDate(e.target.value)}
    className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
    style={{ colorScheme: "dark" }}
  />
</div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full max-w-[150px] px-4 py-2 bg-[#FF6000] text-white rounded hover:bg-[#E3090D] transition font-medium"
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
                  <tr key={row.id} className=" transition">
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
              Page <span className="font-semibold">{currentPage}</span> of {pagination.totalPages} 
              ({pagination.total} records)
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isFetching} className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed">First</button>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || isFetching} className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"><FaAngleLeft /></button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.totalPages))} disabled={currentPage === pagination.totalPages || isFetching} className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"><FaAngleRight /></button>
              <button onClick={() => setCurrentPage(pagination.totalPages)} disabled={currentPage === pagination.totalPages || isFetching} className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralHistory;