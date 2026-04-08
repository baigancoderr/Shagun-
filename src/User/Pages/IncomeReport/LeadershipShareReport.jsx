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

const LeadershipShareReport = () => {
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
    queryKey: ["leadershipShares", search, startDate, endDate, currentPage],
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
        `${appConfig.baseURL}/user/leadership-shares-report?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/user/login");
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch leadership shares data");
      }

      const result = await response.json();
      return result.data; // { data: [...], pagination: {...} }
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: !isDemoMode,
  });

  // Demo mode fallback
  const rawData = isDemoMode ? getDemoData("leadershipShareReport") || { data: [], pagination: {} } : data || {};

  const records = rawData.data || [];
  const pagination = rawData.pagination || { total: 0, page: 1, totalPages: 1 };

  const columns = useMemo(
    () => [
      {
        id: "sno",
        header: "Sr.",
        cell: ({ row }) => (currentPage - 1) * rowsPerPage + row.index + 1,
      },
      {
        accessorKey: "month",
        header: "Month",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        accessorKey: "rank",
        header: "Rank",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        accessorKey: "shares",
        header: "Shares",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(0),
      },
      {
        accessorKey: "selfBusiness",
        header: "Self Business",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
      },
      {
        accessorKey: "directActive",
        header: "Direct Active",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(0),
      },
      {
        accessorKey: "binaryVolume",
        header: "Binary Volume",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
      },
      {
        accessorKey: "leftPV",
        header: "Left PV",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
      },
      {
        accessorKey: "rightPV",
        header: "Right PV",
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
      },
      {
        accessorKey: "assignedAt",
        header: "Assigned At",
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
            : "N/A",
      },
    ],
    [currentPage]
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeadershipShares");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "leadership-shares-report.xlsx");
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">Leadership Shares Report</h2>
        <button
          onClick={exportToExcel}
          disabled={isLoading || records.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Search</label>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            placeholder="Search rank, month..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Start Date</label>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">End Date</label>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full max-w-[150px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {isFetching && !isLoading && (
        <div className="text-center py-4 text-blue-600 font-medium">Loading next page...</div>
      )}

      {isError ? (
        <p className="text-center text-red-500 py-8">{error?.message}</p>
      ) : isLoading ? (
        <SkeletonLoader variant="table" rows={8} />
      ) : (
        <>
          <div className="overflow-auto rounded">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-gray-200 text-blue-700 text-nowrap"
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
              <p className="text-center text-gray-500 py-8">No data found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
            <div>
              Page <span className="font-semibold">{currentPage}</span> of {pagination.totalPages} 
              ({pagination.total} records)
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages || isFetching}
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

export default LeadershipShareReport;