import React, { useState, useMemo } from "react";
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
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaChartLine,
  FaExchangeAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { BiTrendingUp } from "react-icons/bi";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";
import { useDemoMode } from "../Contexts/DemoModeContext";
import { getDemoData } from "../Data/demoData";

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => (
      <div className="text-left text-sm text-secondary">{row.index + 1}</div>
    ),
  },
  columnHelper.accessor("tradedAt", {
    header: "Time Ago",
    cell: (info) => {
      const timestamp = info.getValue();
      const now = Date.now();
      const secondsAgo = Math.floor((now - timestamp * 1000) / 1000);
      if (secondsAgo < 60)
        return `${secondsAgo} second${secondsAgo !== 1 ? "s" : ""} ago`;
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60)
        return `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`;
      const hoursAgo = Math.floor(minutesAgo / 60);
      if (hoursAgo < 24)
        return `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`;
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;
    },
  }),
  columnHelper.accessor("exBuy", {
    header: "Bought From",
    cell: (info) => (info.getValue() ? info.getValue().toUpperCase() : "N/A"),
  }),
  columnHelper.accessor("buyPrice", {
    header: "Buy Price",
    cell: (info) =>
      `$${Number(info.getValue() || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  }),
  columnHelper.accessor("exSell", {
    header: "Sold To",
    cell: (info) => (info.getValue() ? info.getValue().toUpperCase() : "N/A"),
  }),
  columnHelper.accessor("sellPrice", {
    header: "Sell Price",
    cell: (info) =>
      `$${Number(info.getValue() || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  }),
  columnHelper.accessor("ticker", {
    header: "Ticker",
    cell: (info) => (info.getValue() ? info.getValue().toUpperCase() : "N/A"),
  }),
  columnHelper.accessor("amountBuy", {
    header: "Amount Bought",
    cell: (info) =>
      `$${Number(info.getValue() || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  }),
  columnHelper.accessor("amountSell", {
    header: "Amount Sold",
    cell: (info) =>
      `$${Number(info.getValue() || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  }),
  columnHelper.accessor("profit", {
    header: "Profit",
    cell: (info) => {
      const value = Number(info.getValue() || 0);
      return (
        <span className={value > 0 ? "text-green-500" : "text-red-500"}>
          {`$${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        </span>
      );
    },
  }),
  columnHelper.accessor("withdrawalFees", {
    header: "Withdrawal Fees",
    cell: (info) =>
      `$${Number(info.getValue() || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  }),
  columnHelper.accessor("profitAfterFees", {
    header: "Profit - Fees",
    cell: (info) => {
      const value = Number(info.getValue() || 0);
      return (
        <span className={value > 0 ? "text-green-500" : "text-red-500"}>
          {`$${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        </span>
      );
    },
  }),
  columnHelper.accessor("profitPercentage", {
    header: "Profit %",
    cell: (info) => {
      const value = Number(info.getValue() || 0);
      return (
        <span className={value > 0 ? "text-green-500" : "text-red-500"}>
          {`${value.toFixed(2)}%`}
        </span>
      );
    },
  }),
  columnHelper.accessor("profitPercentageAfterFees", {
    header: "Profit % - Fees",
    cell: (info) => {
      const value = Number(info.getValue() || 0);
      return (
        <span className={value > 0 ? "text-green-500" : "text-red-500"}>
          {`${value.toFixed(2)}%`}
        </span>
      );
    },
  }),
  columnHelper.accessor("tradedAt", {
    header: "Traded",
    cell: (info) =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format((info.getValue() || 0) * 1000),
  }),
];

const fetchArbitrage = async () => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const res = await fetch(`${appConfig.baseURL}/user/trade/arbitrage`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch arbitrage data");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const Arbitrage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const { isDemoMode } = useDemoMode();

  // TanStack Query for data fetching
  const {
    data: arbitrageRows = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["arbitrage"],
    queryFn: fetchArbitrage,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !isDemoMode, // Disable API call in demo mode
  });

  // Use demo data if demo mode is active, otherwise use API data
  const displayData = isDemoMode ? getDemoData("arbitrage") : arbitrageRows;

  // Stats calculations
  const stats = useMemo(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const last24hSec = nowSec - 24 * 3600;
    const trades24h = displayData.filter((row) => row.tradedAt >= last24hSec);
    const totalOpportunities = displayData.length;
    const avgProfitMargin =
      displayData.length > 0
        ? displayData.reduce(
          (sum, row) => sum + (Number(row.profitPercentage) || 0),
          0
        ) / displayData.length
        : 0;
    const volume24h = trades24h.reduce(
      (sum, row) => sum + (Number(row.amountBuy) || 0),
      0
    );
    const totalGrossProfit = displayData.reduce(
      (sum, row) => sum + (Number(row.profit) || 0),
      0
    );
    const totalNetProfit = displayData.reduce(
      (sum, row) => sum + (Number(row.profitAfterFees) || 0),
      0
    );
    const avgProfitAmount =
      displayData.length > 0 ? totalGrossProfit / displayData.length : 0;

    const formatCurrency = (value) =>
      `$${Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    return [
      {
        title: "Total Opportunities",
        value: totalOpportunities,
        color: "bg-purple-500",
        icon: <FaExchangeAlt />,
      },
      {
        title: "Total Gross Profit",
        value: formatCurrency(totalGrossProfit),
        color: "bg-green-500",
        icon: <FaArrowUp />,
      },
      {
        title: "Total Net Profit",
        value: formatCurrency(totalNetProfit),
        color: "bg-red-500",
        icon: <FaArrowDown />,
      },
      {
        title: "Avg Profit Amount",
        value: formatCurrency(avgProfitAmount),
        color: "bg-blue-500",
        icon: <BiTrendingUp />,
      },
      {
        title: "Avg Profit Margin",
        value: `${avgProfitMargin.toFixed(2)}%`,
        color: "bg-green-500",
        icon: <FaChartLine />,
      },
      {
        title: "24h Volume",
        value: formatCurrency(volume24h),
        color: "bg-sky-500",
        icon: <FaDollarSign />,
      },
    ];
  }, [displayData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = displayData;
    if (exchangeFilter) {
      data = data.filter(
        (row) =>
          row.exBuy.toLowerCase() === exchangeFilter.toLowerCase() ||
          row.exSell.toLowerCase() === exchangeFilter.toLowerCase()
      );
    }
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.exBuy.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.exSell.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.ticker.toLowerCase().includes(globalFilter.toLowerCase()) ||
          String(row.profitPercentage)
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
      );
    }
    return data;
  }, [exchangeFilter, globalFilter, displayData]);

  // TanStack Table setup
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Excel export with loading state
  const exportToExcel = async () => {
    setIsExportingExcel(true);
    try {
      if (!filteredData.length) {
        toast.error("No data to export", { position: "top-right" });
        setIsExportingExcel(false);
        return;
      }

      // ✅ Take only recent 100
      const recentData = filteredData.slice(0, 100);

      const worksheet = XLSX.utils.json_to_sheet(
        recentData.map((row, index) => ({
          "S.No": index + 1,
          "Time Ago": columns
            .find((col) => col.id === "tradedAt")
            ?.cell({ getValue: () => row.tradedAt }),
          "Bought From": row.exBuy?.toUpperCase() || "N/A",
          "Buy Price": `$${Number(row.buyPrice || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          "Sold To": row.exSell?.toUpperCase() || "N/A",
          "Sell Price": `$${Number(row.sellPrice || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          Ticker: row.ticker?.toUpperCase() || "N/A",
          "Amount Bought": `$${Number(row.amountBuy || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          "Amount Sold": `$${Number(row.amountSell || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          Profit: `$${Number(row.profit || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          "Withdrawal Fees": `$${Number(row.withdrawalFees || 0).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          "Profit - Fees": `$${Number(
            row.profitAfterFees || 0
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          "Profit %": `${Number(row.profitPercentage || 0).toFixed(2)}%`,
          "Profit % - Fees": `${Number(
            row.profitPercentageAfterFees || 0
          ).toFixed(2)}%`,
          Traded: new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format((row.tradedAt || 0) * 1000),
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ArbitrageReport");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "arbitrage-report.xlsx");

      toast.success("Recent 100 records exported successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error("Failed to export Excel", { position: "top-right" });
      console.error("Excel Export Error:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };


  return (
    <div className="text-gray-800 rounded-md max-w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">
          Arbitrage Trading Dashboard
        </h2>
        <button
          onClick={exportToExcel}
          disabled={isExportingExcel}
          className={`px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition ${isExportingExcel ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <PiMicrosoftExcelLogo className="text-green-600" />{" "}
          <span>{isExportingExcel ? "Exporting..." : "Export"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="theme-card-style border-gradient p-4 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 aspect-[1/1] ${item.color} rounded-full flex items-center justify-center text-white`}
              >
                {item.icon}
              </div>
              <span className="text-sm text-gray-600">{item.title}</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search exchange, ticker, or profit percentage..."
          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={exchangeFilter}
          onChange={(e) => setExchangeFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-indigo-500"
        >
          <option value="" className="bg-white text-gray-800">
            All Exchanges
          </option>
          {[
            ...new Set(
              displayData.flatMap((row) => [
                row.exBuy?.toLowerCase(),
                row.exSell?.toLowerCase(),
              ])
            ),
          ]
            .filter((ex) => ex && ex !== "n/a")
            .map((ex) => (
              <option
                key={ex}
                value={ex}
                className="bg-white text-gray-800"
              >
                {ex.toUpperCase()}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          {isLoading ? (
            <SkeletonLoader variant="table" />
          ) : isError ? (
            <p className="text-red-500 p-4">{error.message}</p>
          ) : (
            <>
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-gray-200 text-blue-700 text-nowrap font-semibold"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                          cell.getContext()
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
            No arbitrage data found.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default Arbitrage;