import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";
import { useDemoMode } from '../Contexts/DemoModeContext';
import { getDemoData } from '../Data/demoData';

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => <div className="text-sm text-gray-600">{row.index + 1}</div>,
  },
  columnHelper.accessor("userName", {
    header: "Username",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("firstName", {
    header: "First Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("level", {
    header: "Level",
    cell: (info) => `Level ${info.getValue()}`,
  }),
  // columnHelper.accessor("plan", {
  // header: "Plan",
  // cell: (info) => info.getValue(),
  // }),

  columnHelper.accessor("selfInvestment", {
    header: "Self Investment",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("leftTeamInvestment", {
    header: "Left Team Investment",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("rightTeamInvestment", {
    header: "Right Team Investment",
    cell: (info) => `$${info.getValue()}`,
  }),
   columnHelper.accessor("joinDate", {
    header: "Join Date",
    cell: (info) => info.getValue(),
  }),
];

const LevelWiseTeam = () => {
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [directOnly, setDirectOnly] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [tempSearch, setTempSearch] = useState("");
  const [tempLevel, setTempLevel] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [tempDirectOnly, setTempDirectOnly] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Transform API data to match table structure
  const transformApiData = (apiData) => {
    return apiData.map((user) => ({
      userName: user.userName || "Unknown",
      firstName: user.firstName || "N/A",
      lastName: user.lastName || "N/A",
      email: user.email || "N/A",
      level: user.level || 0,
      // plan: user.plan || "N/A", // Uncomment if plan data is available
      joinDate: user.joinDate
        ? moment(user.joinDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      selfInvestment: user.selfInvestment || 0,
      leftTeamInvestment: user.leftTeamInvestment || 0,
      rightTeamInvestment: user.rightTeamInvestment || 0,
    }));
  };

  // Fetch data using useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "levelWiseTeam",
      level,
      startDate,
      endDate,
      directOnly,
      search,
      pagination.pageIndex,
      pagination.pageSize,
      token,
    ],
    queryFn: async () => {
      if (isDemoMode) {
        // Simulate demo data with filters and pagination
        const demoLevelWiseData = getDemoData("levelWiseTeam");
        let flattened = [];
        for (const lvl in demoLevelWiseData) {
          const users = demoLevelWiseData[lvl] || [];
          users.forEach((user) => {
            flattened.push({
              userName: user.userName,
              firstName: user.firstName || "N/A",
              lastName: user.lastName || "N/A",
              email: user.email || "N/A",
              level: parseInt(lvl),
              // plan: user.plan,
              joinDate: moment(user.joinDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
              selfInvestment: 0,
              leftTeamInvestment: 0,
              rightTeamInvestment: 0,
            });
          });
        }
        // Apply filters client-side for demo
        if (level) {
          flattened = flattened.filter((row) => row.level === parseInt(level));
        }
        if (search) {
          flattened = flattened.filter(
            (row) =>
              row.userName.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (startDate) {
          flattened = flattened.filter((row) =>
            moment(row.joinDate).isSameOrAfter(moment(startDate))
          );
        }
        if (endDate) {
          flattened = flattened.filter((row) =>
            moment(row.joinDate).isSameOrBefore(moment(endDate))
          );
        }
        if (directOnly) {
          flattened = flattened.filter((row) => row.level === 1);
        }
        const total = flattened.length;
        const start = pagination.pageIndex * pagination.pageSize;
        const items = flattened.slice(start, start + pagination.pageSize);
        return {
          items,
          pagination: {
            total,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            totalPages: Math.ceil(total / pagination.pageSize),
          },
        };
      } else {
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        const params = new URLSearchParams();
        if (level) params.append("level", level);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        params.append("directOnly", directOnly ? "true" : "false");
        if (search) params.append("search", search);
        params.append("page", (pagination.pageIndex + 1).toString());
        params.append("limit", pagination.pageSize.toString());
        const response = await fetch(
          `${appConfig.baseURL}/user/referral-level-wise-team?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch referral data");
        }
        const result = await response.json();
        if (!result.data?.data || !Array.isArray(result.data.data)) {
          throw new Error("Invalid referral data received from the server");
        }
        const items = transformApiData(result.data.data);
        return {
          items,
          pagination: result.data.pagination,
        };
      }
    },
    enabled: isDemoMode || !!token,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  const { items = [], pagination: serverPagination = {} } = data || {};

  // Handle form submit to apply filters
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setLevel(tempLevel);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDirectOnly(tempDirectOnly);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LevelWiseTeam");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "level-wise-team.xlsx");
  };

  const table = useReactTable({
    data: items,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: serverPagination.total ?? 0,
  });

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-[#FF6000] font-bold">Level Wise Team</h2>
        <button
  onClick={exportToExcel}
  className="px-6 py-2 h-fit text-base flex items-center justify-center gap-2 rounded border border-[#FF6000]/40 bg-gradient-to-r from-[#FF6000] to-[#E3090D] text-white transition-all duration-300 hover:from-[#ff7b00] hover:to-[#ff2d55]"
>
  <PiMicrosoftExcelLogo className="text-green-200 text-lg" />
  <span>Export</span>
</button>
      </div>
      {isLoading ? (
        <>
          <div className="overflow-auto rounded">
            <SkeletonLoader variant="table" rows={10} />
          </div>
        </>
      ) : isError ? (
        <p className="text-center text-sm text-red-500 py-4">
          {error?.message || "Failed to fetch referral data. Please try again later."}
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <input
  type="text"
  value={tempSearch}
  onChange={(e) => setTempSearch(e.target.value)}
  placeholder="Search by username or ID..."
  className="flex-1 px-4 py-2 bg-transparent text-white border border-gray-400 rounded placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000]"
/>
            {/* <select
              value={tempLevel}
              onChange={(e) => setTempLevel(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
            >
              <option value="">All Levels</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select> */}
            <input
  type="date"
  value={tempStartDate}
  onChange={(e) => setTempStartDate(e.target.value)}
  placeholder="Start Date"
  className="px-4 py-2 bg-transparent text-white border border-gray-400 rounded transition-all duration-300 focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
  style={{ colorScheme: "dark" }}
/>

<input
  type="date"
  value={tempEndDate}
  onChange={(e) => setTempEndDate(e.target.value)}
  placeholder="End Date"
  className="px-4 py-2 bg-transparent text-white border border-gray-400 rounded transition-all duration-300 focus:outline-none focus:border-[#FF6000] focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
  style={{ colorScheme: "dark" }}
/>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={tempDirectOnly}
                onChange={(e) => setTempDirectOnly(e.target.checked)}
                className="h-4 w-4"
              />
              Direct Only
            </label>
           <button
  type="submit"
  className="px-4 py-2 bg-gradient-to-r from-[#FF6000] to-[#E3090D] text-white rounded hover:from-[#ff7b00] hover:to-[#ff2d55] transition-all duration-300"
>
  Apply Filters
</button>
          </form>
          <div className="overflow-auto rounded">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-transparent">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-gray-200 text-[#FF6000] text-nowrap"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition text-nowrap">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 border-b border-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {table.getRowModel().rows.length === 0 && (
              <p className="text-center text-sm text-white mt-4">No data found.</p>
            )}
          </div>
          <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
            <div className="text-white0">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
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

export default LevelWiseTeam;