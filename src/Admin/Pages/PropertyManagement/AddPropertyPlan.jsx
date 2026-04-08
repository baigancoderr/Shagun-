import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { appConfig } from "../../../config/appConfig";

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const InvestmentPlan = () => {
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: investmentPlans = [], isLoading, isError } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await adminApi.getPlans();
      const plans = res?.data || [];
      console.log("Fetched plans:", plans);

      // ✅ UPDATED MAPPING – now shows real API fields exactly as provided
      return plans.map((item) => {
        const tokensSold = Math.floor((item.total_investment || 0) / item.investment_amount);
        const remainingTokens = item.quantity - tokensSold;

        return {
          id: item._id,
          plan_id: item.plan_id,
          plan_name: item.plan_name,
          slug: item.slug || "",
          image: item.image || "", // API already gives full URL[](https://example.com/...)
          investment_amount: item.investment_amount || 0,
          quantity: item.quantity || 0,
          total_value: (item.investment_amount || 0) * (item.quantity || 0),
          total_investment: item.total_investment || 0,
          tokens_sold: tokensSold,
          remaining_tokens: remainingTokens,
          total_buyer: item.total_buyer || 0,
          details: item.details || "No description available",
          status: remainingTokens > 0 ? "AVAILABLE" : "COMPLETED",
          createdAt: item.createdAt,
        };
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch plans"
      );
    },
    staleTime: 5 * 60 * 1000,
  });

  const [filteredPlans, setFilteredPlans] = useState([]);

  useEffect(() => {
    setFilteredPlans(investmentPlans);
  }, [investmentPlans]);

  const handleSearch = useCallback(
    debounce((value) => {
      if (value === "") {
        setFilteredPlans(investmentPlans);
      } else {
        const filtered = investmentPlans.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        );
        setFilteredPlans(filtered);
      }
    }, 300),
    [investmentPlans]
  );

  const { mutate: deletePlan, isPending: isDeleting } = useMutation({
    mutationFn: (id) => adminApi.deletePlan(id),
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      queryClient.invalidateQueries(["plans"]);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      deletePlan(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        "S.No.",
        "Plan ID",
        "Plan Name",
        "Investment per Unit (USD)",
        "Total Quantity",
        "Total Value (USD)",
        "Total Investment Received",
        "Total Buyers",
        "Status",
      ]],
      body: filteredPlans.map((row, index) => [
        index + 1,
        row.plan_id,
        row.plan_name,
        row.investment_amount,
        row.quantity,
        row.total_value,
        row.total_investment,
        row.tokens_sold,
        row.remaining_tokens,
        row.total_buyer,
        row.status,
      ]),
    });
    doc.save("investment-plans.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPlans.map((row, index) => ({
        "S.No.": index + 1,
        "Plan ID": row.plan_id,
        "Plan Name": row.plan_name,
        "Investment per Unit (USD)": row.investment_amount,
        "Total Quantity": row.quantity,
        "Total Value (USD)": row.total_value,
        "Total Investment Received": row.total_investment,
        "Total Buyers": row.total_buyer,
        "Status": row.status,
        "Details": row.details,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Investment Plans");
    XLSX.writeFile(workbook, "investment-plans.xlsx");
  };

  const isMutating = isDeleting;

  // ✅ UPDATED COLUMNS – now shows real Investment Plan details
  const columns = useMemo(
    () => [
      {
        Header: "S.No.",
        accessor: (_row, i) => i + 1,
        id: "serial",
      },
      {
        Header: "Plan ID",
        accessor: "plan_id",
      },
      {
        Header: "Plan Name",
        accessor: "plan_name",
        Cell: ({ value }) => (
          <div className="max-w-[220px] truncate" title={value}>
            {value}
          </div>
        ),
      },
      {
        Header: "Investment per Unit (USD)",
        accessor: "investment_amount",
      },
      {
        Header: "Total Quantity",
        accessor: "quantity",
      },
      {
        Header: "Total Value (USD)",
        accessor: "total_value",
      },
      {
        Header: "Total Investment Received",
        accessor: "total_investment",
      },
      {
        Header: "Total Buyers",
        accessor: "total_buyer",
      },
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ value }) =>
          value ? (
            <img
              src={value}
              alt="Plan"
              className="w-12 h-12 rounded object-cover border"
              onError={(e) => {
                e.target.src = "/no-image.png";
              }}
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              value === "AVAILABLE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Details",
        accessor: "details",
        Cell: ({ value }) => (
          <div className="max-w-[180px] truncate" title={value}>
            {value}
          </div>
        ),
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(
                  `/admin/property-management/add-property-plan/edit-property/${row.original.plan_id}`
                )
              }
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              title="Edit Plan"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              title="Delete Plan"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: filteredPlans,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    usePagination
  );

  return (
    <div className="p-1 sm:p-2 flex-1 text-nowrap max-w-[1240px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#103944]">Investment Plans</h2>
        <button
          onClick={() => navigate("/admin/property-management/add-property-plan/add-property")}
          className="flex items-center text-xs sm:text-lg gap-1 sm:gap-2 bg-[#103944] text-white px-2 py-1 sm:px-4 sm:py-2 rounded hover:bg-[#0e9d52]"
        >
          <FaPlus /> Add New Plan
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-xs sm:text-sm disabled:opacity-50"
            disabled={isLoading || isMutating}
            aria-label="Export to PDF"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-xs sm:text-sm disabled:opacity-50"
            disabled={isLoading || isMutating}
            aria-label="Export to Excel"
          >
            Export Excel
          </button>
        </div>
        <div className="flex items-center justify-end">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search plans..."
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
            aria-label="Search investment plans"
          />
          <button
            onClick={() => handleSearch(searchInput)}
            className="ml-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52] text-sm"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-200">
        <table
          {...getTableProps()}
          className="min-w-[1600px] w-full text-sm border"
        >
          <thead className="bg-[#103944] text-white uppercase">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="p-3 border whitespace-nowrap font-medium"
                    key={column.id}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-600">
                  Loading plans...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-red-600">
                  Error loading data. Please try again.
                </td>
              </tr>
            ) : page.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-700">
                  No plans found
                </td>
              </tr>
            ) : (
              page.map((row, index) => {
                prepareRow(row);
                const rowKey = row.original.id || `row-${index}`;
                return (
                  <tr
                    {...row.getRowProps()}
                    key={rowKey}
                    className="hover:bg-gray-50"
                  >
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className="p-3 border whitespace-nowrap"
                        key={cell.column.id}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end mt-4">
        <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage || isLoading || isMutating}
          className={`px-4 py-2 mr-2 font-semibold rounded ${
            canPreviousPage && !isLoading && !isMutating
              ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
              : "bg-[#103944] text-white cursor-not-allowed opacity-50"
          }`}
          aria-label="Previous page"
        >
          Prev
        </button>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage || isLoading || isMutating}
          className={`px-4 py-2 font-semibold rounded ${
            canNextPage && !isLoading && !isMutating
              ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
              : "bg-[#103944] text-white cursor-not-allowed opacity-50"
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InvestmentPlan;