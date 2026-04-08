import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
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
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  // {
  //   id: "sno",
  //   header: "Sr.",
  //   cell: ({ row }) => <span>{row.index + 1}</span>,
  // },

  columnHelper.accessor("leftChildInvestment", {
    header: "Left Child Investment + Carry Forward",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("rightChildInvestment", {
    header: "Right Child Investment + Carry Forward",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("leftCarryForward", {
    header: "Left Carry Forward",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("rightCarryForward", {
    header: "Right Carry Forward",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("previousLeftCarry", {
    header: "Previous Left Carry",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("previousRightCarry", {
    header: "Previous Right Carry",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("matches", {
    header: "Matches",
    cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => info.getValue(),
  }),
];

const BinaryIncomeReport = () => {
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
      date: item.distributionDate
        ? moment(item.distributionDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      leftChildInvestment: item.leftChildInvestment || 0,
      rightChildInvestment: item.rightChildInvestment || 0,
      leftCarryForward: item.leftCarryForward || 0,
      rightCarryForward: item.rightCarryForward || 0,
      previousLeftCarry: item.previousLeftCarry || 0,
      previousRightCarry: item.previousRightCarry || 0,
      matches: item.matches || 0,
      amount: item.amount || 0,
    }));
  };

  // Fetch data using useQuery
  const { data: apiResponse = { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }, isLoading, isError, error } = useQuery({
    queryKey: ["binaryIncomeReport", pagination.pageIndex, pagination.pageSize, token],
    queryFn: async () => {
      if (isDemoMode) {
        // Simulate demo data with pagination and filtering
        const demoData = getDemoData("binaryIncomeReport") || [];
        const filtered = demoData.filter((row) =>
          Object.values(row).some((val) =>
            String(val ?? "").toLowerCase().includes(globalFilter.toLowerCase())
          )
        );
        const start = pagination.pageIndex * pagination.pageSize;
        const sliced = filtered.slice(start, start + pagination.pageSize);
        const items = transformApiData(sliced);
        return {
          data: items,
          pagination: {
            total: filtered.length,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            totalPages: Math.ceil(filtered.length / pagination.pageSize),
          },
        };
      } else {
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }


        const params = new URLSearchParams();

        params.append("page", (pagination.pageIndex + 1).toString());
        params.append("limit", pagination.pageSize.toString());

        const response = await fetch(`${appConfig.baseURL}/user/binary-income-report?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid token. Please log in again.");
          }
          throw new Error("Failed to fetch binary income data");
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

  const { data: displayData = [], pagination: serverPagination = {} } = apiResponse;

  const filteredData = useMemo(() => {
    return displayData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [displayData, globalFilter]);

  const table = useReactTable({
    data: displayData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: serverPagination.totalPages ?? -1,
    rowCount: serverPagination.total ?? 0,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setGlobalFilter(tempGlobalFilter);
    table.setPageIndex(0);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(displayData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BinaryIncomeReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "binary-income-report.xlsx");
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl font-bold">Binary Income Report</h2>
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
          {error?.message || "Failed to fetch binary income data. Please try again later."}
        </p>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setGlobalFilter(tempGlobalFilter);
              setStartDate(tempStartDate);
              setEndDate(tempEndDate);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end"
          >
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Search
              </label>
              <input
                type="text"
                value={tempGlobalFilter}
                onChange={(e) => setTempGlobalFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full max-w-[150px] px-4 py-2 bg-blue-600 text-white rounded"
              >
                Filters
              </button>
            </div>
          </form>

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


              {/* <button
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
              </button> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BinaryIncomeReport;