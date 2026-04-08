import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment";
import { appConfig } from "../../../config/appConfig";
import SkeletonLoader from "../../Components/Comman/Skeletons";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../Contexts/DemoModeContext";
import { getDemoData } from "../../Data/demoData";

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  columnHelper.accessor("swapDetails.originalAmount", {
    header: "From (USDT)",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("emgtAmount", {
    header: "Token Amount",
    cell: (info) => `${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("swapDetails.fee", {
    header: "Swap Fee",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("tokenPrice", {
    header: "Token Price",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) =>
      info.getValue()
        ? moment(info.getValue()).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          info.getValue() === "Completed"
            ? "bg-green-500 text-black"
            : "bg-yellow-800 text-yellow-300"
        }`}
      >
        {info.getValue() || "N/A"}
      </span>
    ),
  }),
];

const fetchSwaps = async () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found. Please log in.");
  if (!appConfig.baseURL) throw new Error("Base URL is not configured.");

  const response = await axios.get(`${appConfig.baseURL}/user/swaps`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const swaps = response.data.data || [];
  return swaps.map((swap) => ({
    userId: swap.userId?._id || "N/A",
    emgtAmount: swap.emgtAmount || 0,
    tokenPrice: swap.tokenPrice || 0,
    walletType: swap.walletType || "N/A",
    currencyType: swap.currencyType || "EMGT",
    status: swap.status || "N/A",
    createdAt: swap.createdAt || null,
    swapDetails: {
      originalAmount: swap.usdtAmount || 0,
      fee: swap.swapDetails?.fee || 0,
    },
  }));
};

const SwapReport = () => {
  const { isDemoMode } = useDemoMode();

  // Final applied filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Temporary form states
  const [tempSearch, setTempSearch] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data: apiSwaps = [], isLoading, isError, error } = useQuery({
    queryKey: ["swaps"],
    queryFn: fetchSwaps,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isDemoMode,
  });

  const rawData = isDemoMode ? getDemoData("swapReport") || [] : apiSwaps;

  // Filtered data (client-side)
  const filteredData = useMemo(() => {
    let result = [...rawData];

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) => {
        const dateStr = row.createdAt
          ? moment(row.createdAt).format("YYYY-MM-DD HH:mm:ss").toLowerCase()
          : "";
        return (
          dateStr.includes(lower) ||
          (row.status || "").toLowerCase().includes(lower)
        );
      });
    }

    if (startDate) {
      const start = moment(startDate).startOf("day");
      result = result.filter((row) =>
        row.createdAt ? moment(row.createdAt).isSameOrAfter(start) : false
      );
    }

    if (endDate) {
      const end = moment(endDate).endOf("day");
      result = result.filter((row) =>
        row.createdAt ? moment(row.createdAt).isSameOrBefore(end) : false
      );
    }

    return result;
  }, [rawData, search, startDate, endDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: filteredData.length > 0
      ? Math.ceil(filteredData.length / pagination.pageSize)
      : -1,
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const exportToExcel = () => {
    const exportData = filteredData.map((row, index) => ({
      "S.No": index + 1,
      "From (USDT)": `$${Number(row.swapDetails?.originalAmount || 0).toFixed(2)}`,
      "EMGT Amount": Number(row.emgtAmount || 0).toFixed(2),
      "Swap Fee": `$${Number(row.swapDetails?.fee || 0).toFixed(2)}`,
      "Token Price": `$${Number(row.tokenPrice || 0).toFixed(2)}`,
      Date: row.createdAt
        ? moment(row.createdAt).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      Status: row.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SwapReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer]),
      `swap-report-${moment().utcOffset(330).format("YYYY-MM-DD")}.xlsx`
    );
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-xl md:text-2xl text-[#ff6000] font-bold">Shopping Report</h2>
        <button
          onClick={exportToExcel}
          disabled={filteredData.length === 0 || isLoading}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-transparent hover:bg-[#FF6000] transition disabled:opacity-40"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleApplyFilter}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end"
      >
        <div>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            placeholder="Search by date or status..."
            className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff6000]"
          />
        </div>
<div>
  <input
    type="date"
    value={tempStartDate}
    onChange={(e) => setTempStartDate(e.target.value)}
    className="w-full px-4 py-2 bg-transparent text-white border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6000] [color-scheme:dark]"
  />
</div>

<div>
  <input
    type="date"
    value={tempEndDate}
    onChange={(e) => setTempEndDate(e.target.value)}
    className="w-full px-4 py-2 bg-transparent text-white border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6000] [color-scheme:dark]"
  />
</div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2  bg-transparent text-white border rounded hover:bg-[#ff6000]  transition font-medium"
          >
            Apply Filter
          </button>
        </div>
      </form>

      {isLoading ? (
        <SkeletonLoader variant="table" />
      ) : isError ? (
        <div className="text-center text-red-500 py-6">
          {error?.message || "Failed to load swap data"}
        </div>
      ) : (
        <>
          <div className="overflow-auto rounded border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-transparent">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-3 border-b border-gray-200 text-[#FF6000] font-medium text-nowrap"
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
                      <td key={cell.id} className="px-4 py-3 border-b border-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <p className="text-center text-gray-500 py-8">No records found</p>
            )}
          </div>

          {/* Pagination - अब दिखना चाहिए */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-gray-600">
              <div>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                  disabled={pagination.pageIndex === 0 || isLoading}
                  className="px-3 py-1 border rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      pageIndex: Math.max(p.pageIndex - 1, 0),
                    }))
                  }
                  disabled={pagination.pageIndex === 0 || isLoading}
                  className="px-3 py-1 border rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaAngleLeft />
                </button>
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                  }
                  disabled={
                    isLoading ||
                    pagination.pageIndex + 1 >= table.getPageCount()
                  }
                  className="px-3 py-1 border rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaAngleRight />
                </button>
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      pageIndex: table.getPageCount() - 1,
                    }))
                  }
                  disabled={
                    isLoading ||
                    pagination.pageIndex + 1 >= table.getPageCount()
                  }
                  className="px-3 py-1 border rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SwapReport;










