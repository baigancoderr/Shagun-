import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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

const columns = [
  {
  id: "sno",
  header: "Sr.",
  cell: ({ row, table }) => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize  = table.getState().pagination.pageSize;
    return pageIndex * pageSize + row.index + 1;
  },
},
  // {
  //   id: "sno",
  //   header: "Sr.",
  //   cell: ({ row }) => <span>{row.index + 1}</span>,
  // },
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("investmentAmount", {
    header: "Invested Amt",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("level", {
    header: "Level",
    cell: (info) => `Level ${info.getValue()}`,
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          info.getValue() === "completed"
            ? "bg-green-800 text-green-300"
            : "bg-yellow-800 text-yellow-300"
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

const RankIncomeReport = () => {
  const { isDemoMode } = useDemoMode();
  const [globalFilter, setGlobalFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Fetch data using useQuery
  const { data: apiResponse = { referrals: [], selfInvestment: 0, teamInvestment: 0, referralCount: 0, totalReferralIncome: 0 }, isLoading, isError, error } = useQuery({
    queryKey: ["referralHistory", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${appConfig.baseURL}/user/referral-income`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid token. Please log in again.");
        }
        throw new Error("Failed to fetch referral income data");
      }

      const result = await response.json();

      const referrals = result.data?.referrals || [];
      const selfInvestment = result.data?.selfInvestment || 0;
      const teamInvestment = result.data?.teamInvestment || 0;
      const referralCount = result.data?.referralCount || 0;
      const totalReferralIncome = result.data?.totalReferralIncome || 0;

      const flattenedData = transformApiData(referrals);

      return {
        referrals: flattenedData,
        selfInvestment,
        teamInvestment,
        referralCount,
        totalReferralIncome,
      };
    },
    enabled: !!token && !isDemoMode,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  // Transform API data
  const transformApiData = (referrals) => {
    return referrals.map((referral) => ({
      date: referral.createdAt
        ? moment(referral.createdAt).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      from: referral.referredId || "Unknown",
      investmentAmount: referral.investmentAmount || 0,
      level: referral.level,
      amount: referral.amount || 0,
      status: referral.status || "Unknown",
    }));
  };

  // Use demo data if demo mode is active
  const displayReferrals = isDemoMode
    ? getDemoData("referralHistory").map((item) => ({
        ...item,
        date: moment(item.date).utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      }))
    : apiResponse.referrals;

  const filteredData = useMemo(() => {
    let data = displayReferrals;
    if (levelFilter) {
      data = data.filter((row) => row.level === parseInt(levelFilter));
    }
    if (globalFilter) {
      data = data.filter(
        (row) =>
          (row.from || "").toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.date.includes(globalFilter)
      );
    }
    return data;
  }, [displayReferrals, levelFilter, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReferralHistory");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "referral-history.xlsx");
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">Referral History</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Show Summary */}
      {!isDemoMode && (
        <div className="flex gap-8 mb-6 bg-white p-4 rounded border flex-wrap">
          <div>
            <p className="text-sm text-gray-500">Self Investment</p>
            <p className="text-2xl font-semibold text-blue-700">
              ${apiResponse.selfInvestment}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Team Investment</p>
            <p className="text-2xl font-semibold text-blue-700">
              ${apiResponse.teamInvestment}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Referral Count</p>
            <p className="text-2xl font-semibold text-blue-700">
              {apiResponse.referralCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Referral Income</p>
            <p className="text-2xl font-semibold text-blue-700">
              ${apiResponse.totalReferralIncome}
            </p>
          </div>
        </div>
      )}

      {isError ? (
        <p className="text-center text-sm text-red-500 py-4">
          {error?.message || "Failed to fetch referral income data. Please try again later."}
        </p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name..."
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>

          <div className="overflow-auto rounded">
            {isLoading ? (
              <SkeletonLoader variant="table" />
            ) : (
              <>
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
                      <tr key={row.id} className="hover:bg-gray-50 transition text-nowrap">
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
                  <p className="text-center text-sm text-gray-500 mt-4">No data found.</p>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
            <div className="text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
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

export default RankIncomeReport;