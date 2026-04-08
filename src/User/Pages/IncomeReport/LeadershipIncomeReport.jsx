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
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  columnHelper.accessor("rank", {
    header: "Rank",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("shares", {
    header: "Shares",
    cell: (info) => Number(info.getValue() ?? 0).toFixed(0),
  }),
  columnHelper.accessor("poolAmount", {
    header: "Pool Amount",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("totalShares", {
    header: "Total Shares",
    cell: (info) => Number(info.getValue() ?? 0).toFixed(0),
  }),
  columnHelper.accessor("bonusAmount", {
    header: "Bonus Amount",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  // columnHelper.accessor("month", {
  //   header: "Month",
  //   cell: (info) => info.getValue() ? moment(info.getValue()).format("YYYY-MM-DD") : "N/A",
  // }),
  columnHelper.accessor('distributionDate', {
          header: 'Date',
          cell: (info) =>
            info.getValue()
              ? moment(info.getValue()).utcOffset(330).format('YYYY-MM-DD HH:mm:ss')
              : '—',
        }),
];

const LeadershipIncomeReport = () => {
  const { isDemoMode } = useDemoMode();
  const [globalFilter, setGlobalFilter] = useState("");
  const [tempGlobalFilter, setTempGlobalFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Transform API data
  const transformApiData = (apiData) => {
    return apiData.map((item) => ({
      rank: item.rank || "N/A",
      shares: item.shares || 0,
      poolAmount: item.poolAmount || 0,
      totalShares: item.totalShares || 0,
      bonusAmount: item.bonusAmount || 0,
      month: item.month || null,
      distributionDate: item.distributionDate || null,
    }));
  };

 
  // Fetch data using useQuery
  const { data: apiResponse = { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }, isLoading, isError, error } = useQuery({
    // queryKey: ["leadershipIncomeReport", pagination.pageIndex, pagination.pageSize, token],
    queryKey: [
      "leadershipIncomeReport",
      pagination.pageIndex,
      pagination.pageSize,
      startDate,
      endDate,
      token
    ],
    queryFn: async () => {
      if (isDemoMode) {
        // Simulate demo data with pagination
        const demoData = getDemoData("leadershipIncomeReport") || [];
        const start = pagination.pageIndex * pagination.pageSize;
        const items = demoData.slice(start, start + pagination.pageSize).map((item) => ({
          ...item,
          month: moment(item.month).format("YYYY-MM-DD"),
        }));
        return {
          data: items,
          pagination: {
            total: demoData.length,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            totalPages: Math.ceil(demoData.length / pagination.pageSize),
          },
        };
      } else {
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const params = new URLSearchParams();
        params.append("page", (pagination.pageIndex + 1).toString());
        params.append("limit", pagination.pageSize.toString());

        if (startDate) {
          params.append("startDate", startDate);
        }

        if (endDate) {
          params.append("endDate", endDate);
        }


        const response = await fetch(`${appConfig.baseURL}/user/leadership-income-report?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid token. Please log in again.");
          }
          throw new Error("Failed to fetch leadership income data");
        }

        const result = await response.json();
        const items = transformApiData(result.data.data || []);
        return {
          data: items,
          pagination: result.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
        };
      }
    },
    enabled: !!token || isDemoMode,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  console.log("API Response:", apiResponse);

  const { data: displayData = [], pagination: serverPagination = {} } = apiResponse;

  const filteredData = displayData;


  // const filteredData = useMemo(() => {
  //   return displayData.filter((row) =>
  //     Object.values(row).some((val) =>
  //       String(val).toLowerCase().includes(globalFilter.toLowerCase())
  //     )
  //   );
  // }, [displayData, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: serverPagination.totalPages ?? -1,
    rowCount: serverPagination.total ?? 0,
  });

  const handleSearch = (e) => {
    e.preventDefault();

    setGlobalFilter(tempGlobalFilter);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };


  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   setGlobalFilter(tempGlobalFilter);
  // };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeadershipIncomeReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "leadership-income-report.xlsx");
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl font-bold">Leadership Income Report</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {isError ? (
        <p className="text-center text-sm text-red-500 py-4">
          {error?.message || "Failed to fetch leadership income data. Please try again later."}
        </p>
      ) : (
        <>
          {/* <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={tempGlobalFilter}
              onChange={(e) => setTempGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </form> */}

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 items-end"
          >
            <input
              type="text"
              value={tempGlobalFilter}
              onChange={(e) => setTempGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="px-4 py-2 bg-white border border-gray-300 rounded"
            />

            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded"
            />

            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Filter
            </button>
          </form>


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
                            className="text-left px-4 py-2 border-b border-gray-200 text-nowrap"
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
            <div>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: 0,
                  }))
                }
                disabled={pagination.pageIndex === 0 || isLoading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.max(prev.pageIndex - 1, 0),
                  }))
                }
                disabled={pagination.pageIndex === 0 || isLoading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleLeft />
              </button>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1,
                  }))
                }
                disabled={
                  isLoading ||
                  pagination.pageIndex + 1 >= table.getPageCount()
                }
                className="px-3 py-1 border text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.max(table.getPageCount() - 1, 0),
                  }))
                }
                disabled={
                  isLoading ||
                  pagination.pageIndex + 1 >= table.getPageCount()
                }
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

export default LeadershipIncomeReport;