import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "../../Service/adminApi";

// Define reusable styles
const styles = {
  badge: {
    base: "px-2 py-1 rounded font-medium text-xs",
    green: "bg-green-100 text-green-800 border border-green-300",
    red: "bg-red-100 text-red-800 border border-red-300",
  },
  button: {
    primary: "bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52]",
    secondary: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
    exportPDF: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
    exportExcel: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
    disabled: "bg-gray-300 text-gray-600 cursor-not-allowed px-4 py-2 rounded",
    close:
      "absolute right-5 top-5 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600",
  },
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("general"); // "general" or "user_id"
  const [editUser, setEditUser] = useState(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  // Fetch user data for the current page
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getUserData", pagination.pageIndex, pagination.pageSize, searchInput, searchType],
    queryFn: async () => {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const search = searchType === "general" ? searchInput : "";
      const user_id = searchType === "user_id" ? searchInput : "";
      const res = await adminApi.getUserData(page, limit, search, user_id);
      const responseData = res?.data;
      console.log(`Full Response for Page ${page}:`, responseData);

      const users = responseData?.users || [];
      if (!Array.isArray(users)) {
        throw new Error("Invalid response: users array not found");
      }
      const totalPages = responseData?.totalPages || 1;
      console.log("Users Fetched for Page:", users.length);
      return { users, totalPages };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const fetchData = data?.users || [];
  const pageCount = data?.totalPages || -1;

  // Reset page index when search input or type changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchInput, searchType]);

  // Update user mutation (unchanged)
  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await adminApi.updateUserData(id, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries(["getUserData"]);
      setEditUser(null);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update user.";
      toast.error(message);
    },
  });

  // Column definitions – corrected spelling + proper username/user_id mapping
 // Updated columns for your current API data
const allColumnKeys = [
  "role",
  // "_id",
  "userId",           // CPRD0MRSG etc.
  "username",
  "name",
  "telegramId",
  "referredBy",
  "referralCode",
  "totalReferrals",
  "referralEarnings",
  "walletAddress",
  "walletBalance",
  "totalEarnings",
  "totalInvested",
  "activePackage",
  "dailyIncome",
  "isActive",
  "createdAt",
];

const COLUMN_LABELS = {
  role: "Role",
  // _id: "Mongo ID",
  userId: "User ID",
  username: "Telegram Username",
  name: "Name",
  telegramId: "Telegram ID",
  referredBy: "Referred By",
  referralCode: "Referral Code",
  totalReferrals: "Total Referrals",
  referralEarnings: "Referral Earnings",
  walletAddress: "Wallet Address",
  walletBalance: "Wallet Balance",
  totalEarnings: "Total Earnings",
  totalInvested: "Total Invested",
  activePackage: "Active Package",
  dailyIncome: "Daily Income",
  isActive: "Status",
  createdAt: "Registered On",
};

  const keyMapping = {
    role: ["role"],
    id: ["user_id"], // User ID column → user_id
    referredBy: ["referredBy", "sponsor_id"],
    userId: ["first_name", "last_name"], // Username column → username (first priority)
    email: ["email", "userEmail"],
    depositWallet: ["depositWallet.amount"],
    myWallet: ["myWallet.amount"],
    referralWallet: ["referralWallet.amount"],
    principalWallet: ["principalWallet.amount"], // corrected spelling
    emgtWallet: ["emgtWallet.amount"],
    reward: ["reward", "bonanzaEnabled"],
    walletAddress: ["walletAddress", "wallet_addr"],
    investmentPackage: ["investmentPackage", "package"],
    totalEarnings: ["totalAllRewards", "myWallet.amount", "referralWallet.amount"],
    registrationDate: ["registrationDate", "regDate", "createdAt"],
    paidStatus: ["paidStatus", "paymentStatus"],
    status: ["status", "activeStatus", "isEmailVerified"],
    blockStatus: ["blockStatus", "blocked", "isBlocked"],
    usdtWithdraw: ["usdtWithdraw", "withdrawEnabled"],
    roi: ["roi", "returnOnInvestment", "roiEnabled"],
  };
  
  // Simple normalization for new data structure
const normalizedUsers = useMemo(() => {
  return fetchData.map((user, index) => {
    const normalized = {};

    allColumnKeys.forEach((key) => {
      let value = user[key];

      if (value === undefined || value === null) {
        value = key === "isActive" ? "Inactive" : "N/A";
      }

      // Format boolean status
      if (key === "isActive") {
        value = value ? "Active" : "Inactive";
      }

      // Format date
      if (key === "createdAt" && value) {
        value = new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      normalized[key] = value;
    });

    return normalized;
  });
}, [fetchData]);


  // Quick login (unchanged)
  const handleQuickLogin = async (user) => {
    try {
      console.log("Attempting quick login for user ID:", user.id);
      const response = await adminApi.adminLoginAsUser({ userId: user.id });
      if (response.status === "success") {
        const { token, redirectUrl } = response.data;
        if (!token || !redirectUrl) throw new Error("Missing token or redirect URL");
        localStorage.setItem("authToken", token);
        const newTab = window.open(redirectUrl, "_blank");
        if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          toast.error("Popup blocked. Please allow popups.");
        } else {
          toast.success("Opened user dashboard in new tab.");
        }
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      toast.error(`Failed to login as user: ${error.message || "Unknown error"}`);
    }
  };
  // Edit handlers (updated for principalWallet)
  const handleEdit = (user) => {
    const defaultUser = { missingFields: user.missingFields };
    allColumnKeys.forEach((key) => {
      defaultUser[key] =
        user[key] ??
        (key === "reward"
          ? "No Reward"
          : key === "paidStatus"
          ? "Unpaid"
          : key === "status"
          ? "Inactive"
          : key === "blockStatus"
          ? "Blocked"
          : key === "usdtWithdraw" || key === "roi"
          ? "Off"
          : key === "myWallet" || key === "emgtWallet" || key === "principalWallet" || key === "depositWallet"
          ? 0
          : "N/A");
    });
    setEditUser(defaultUser);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };
  const saveEdit = () => {
    if (window.confirm("Are you sure you want to save changes?")) {
      const payload = {
        withdrawEnabled: editUser.usdtWithdraw === "On",
        roiEnabled: editUser.roi === "On",
        isBlocked: editUser.blockStatus === "Blocked",
        bonanzaEnabled: editUser.reward === "Reward",
      };
      updateUser({ id: editUser.id, data: payload });
    }
  };
  const cancelEdit = () => {
    if (window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.")) {
      setEditUser(null);
    }
  };
  const formatColumnName = (key) => COLUMN_LABELS[key] || key;
  const getBadgeStyle = (value, field) => {
  const base = styles.badge.base;
  const green = `${base} ${styles.badge.green}`;
  const red = `${base} ${styles.badge.red}`;

  if (field === "isActive") {
    return value === "Active" ? green : red;
  }
  return base;
};
  const columns = useMemo(() => {
    const dataColumns = [
      { accessorKey: "sNo", header: "S.No.", cell: ({ row }) => (pagination.pageIndex * pagination.pageSize) + row.index + 1 },
      ...allColumnKeys.map((key) => ({
        accessorKey: key,
        header: formatColumnName(key),
       cell: ({ getValue }) => {
  const value = getValue() ?? "N/A";
  if (["isActive"].includes(key)) {   // changed
    return <span className={getBadgeStyle(value, key)}>{value}</span>;
  }
  return String(value);
},
      })),
    ];
    return [
      ...dataColumns,
      // {
      //   id: "quickLogin",
      //   header: "Quick Login",
      //   cell: ({ row }) => (
      //     <button
      //       onClick={() => handleQuickLogin(row.original)}
      //       className={styles.button.primary}
      //     >
      //       Login
      //     </button>
      //   ),
      // },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <button
            onClick={() => handleEdit(row.original)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            View
          </button>
        ),
      },
    ];
  }, [pagination.pageIndex, pagination.pageSize]);
  const table = useReactTable({
    data: normalizedUsers,
    columns,
    pageCount,
    state: { pagination, globalFilter: searchInput },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearchInput,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });
  // Export functions (fetch all data for export)
  const [isExporting, setIsExporting] = useState(false);
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      let allUsers = [];
      let page = 1;
      let totalPages = 1;
      const limit = 10;
      const search = searchType === "general" ? searchInput : "";
      const user_id = searchType === "user_id" ? searchInput : "";
      while (page <= totalPages) {
        const res = await adminApi.getUserData(page, limit, search, user_id);
        const responseData = res?.data;
        const usersPage = responseData?.users || [];
        if (!Array.isArray(usersPage)) {
          throw new Error("Invalid response: users array not found");
        }
        allUsers = [...allUsers, ...usersPage];
        totalPages = responseData?.totalPages || 1;
        page++;
      }
      const normalizedAll = allUsers.map((user, index) => {
        const normalized = { missingFields: new Set() };
        allColumnKeys.forEach((key) => {
          if (key === "userId") {
            const firstName = user["first_name"];
            const lastName = user["last_name"];
            let value = "N/A";
            if (firstName && lastName) {
              value = `${firstName} ${lastName}`;
            } else if (firstName) {
              value = firstName;
            } else if (lastName) {
              value = lastName;
            }
            normalized[key] = value;
            if (value === "N/A") {
              normalized.missingFields.add(key);
            }
          } else {
            const possibleKeys = keyMapping[key];
            let value;
            for (const k of possibleKeys) {
              if (k.includes(".")) {
                const parts = k.split(".");
                let current = user;
                let found = true;
                for (const part of parts) {
                  if (current && typeof current === "object" && part in current) {
                    current = current[part];
                  } else {
                    found = false;
                    break;
                  }
                }
                if (found && current !== undefined && typeof current !== "object") {
                  value = current;
                  break;
                }
              } else if (user[k] !== undefined && typeof user[k] !== "object") {
                value = user[k];
                break;
              }
            }
            if (value === undefined || value === null) {
              if (["myWallet", "emgtWallet", "principalWallet", "depositWallet", "totalEarnings"].includes(key)) {
                value = 0;
              } else if (key === "status") {
                value = "Inactive";
              } else if (key === "reward") {
                value = "No Reward";
              } else if (key === "paidStatus") {
                value = "Unpaid";
              } else if (key === "blockStatus") {
                value = "Blocked";
              } else if (["usdtWithdraw", "roi"].includes(key)) {
                value = "Off";
              } else {
                value = "N/A";
              }
              normalized.missingFields.add(key);
            } else if (key === "status" && typeof value === "boolean") {
              value = value ? "Active" : "Inactive";
            } else if (key === "reward" && typeof value === "boolean") {
              value = value ? "Reward" : "No Reward";
            } else if (key === "blockStatus" && typeof value === "boolean") {
              value = value ? "Blocked" : "Unblocked";
            } else if (["usdtWithdraw", "roi"].includes(key) && typeof value === "boolean") {
              value = value ? "On" : "Off";
            }
            normalized[key] = value;
          }
        });
        normalized.id = normalized.id !== "N/A" ? normalized.id : `temp-${index + 1}`;
        return normalized;
      });
      if (normalizedAll.length === 0) return toast.warn("No data to export.");
      const exportData = normalizedAll.map((row) => {
        const rowData = {};
        allColumnKeys.forEach((key) => {
          rowData[formatColumnName(key)] = row[key];
        });
        return rowData;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "UserManagement.xlsx");
      toast.success("Exported to Excel successfully.");
    } catch (err) {
      toast.error("Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      let allUsers = [];
      let page = 1;
      let totalPages = 1;
      const limit = 10;
      const search = searchType === "general" ? searchInput : "";
      const user_id = searchType === "user_id" ? searchInput : "";
      while (page <= totalPages) {
        const res = await adminApi.getUserData(page, limit, search, user_id);
        const responseData = res?.data;
        const usersPage = responseData?.users || [];
        if (!Array.isArray(usersPage)) {
          throw new Error("Invalid response: users array not found");
        }
        allUsers = [...allUsers, ...usersPage];
        totalPages = responseData?.totalPages || 1;
        page++;
      }
      const normalizedAll = allUsers.map((user, index) => {
        const normalized = { missingFields: new Set() };
        allColumnKeys.forEach((key) => {
          if (key === "userId") {
            const firstName = user["first_name"];
            const lastName = user["last_name"];
            let value = "N/A";
            if (firstName && lastName) {
              value = `${firstName} ${lastName}`;
            } else if (firstName) {
              value = firstName;
            } else if (lastName) {
              value = lastName;
            }
            normalized[key] = value;
            if (value === "N/A") {
              normalized.missingFields.add(key);
            }
          } else {
            const possibleKeys = keyMapping[key];
            let value;
            for (const k of possibleKeys) {
              if (k.includes(".")) {
                const parts = k.split(".");
                let current = user;
                let found = true;
                for (const part of parts) {
                  if (current && typeof current === "object" && part in current) {
                    current = current[part];
                  } else {
                    found = false;
                    break;
                  }
                }
                if (found && current !== undefined && typeof current !== "object") {
                  value = current;
                  break;
                }
              } else if (user[k] !== undefined && typeof user[k] !== "object") {
                value = user[k];
                break;
              }
            }
            if (value === undefined || value === null) {
              if (["myWallet", "emgtWallet", "principalWallet", "depositWallet", "totalEarnings"].includes(key)) {
                value = 0;
              } else if (key === "status") {
                value = "Inactive";
              } else if (key === "reward") {
                value = "No Reward";
              } else if (key === "paidStatus") {
                value = "Unpaid";
              } else if (key === "blockStatus") {
                value = "Blocked";
              } else if (["usdtWithdraw", "roi"].includes(key)) {
                value = "Off";
              } else {
                value = "N/A";
              }
              normalized.missingFields.add(key);
            } else if (key === "status" && typeof value === "boolean") {
              value = value ? "Active" : "Inactive";
            } else if (key === "reward" && typeof value === "boolean") {
              value = value ? "Reward" : "No Reward";
            } else if (key === "blockStatus" && typeof value === "boolean") {
              value = value ? "Blocked" : "Unblocked";
            } else if (["usdtWithdraw", "roi"].includes(key) && typeof value === "boolean") {
              value = value ? "On" : "Off";
            }
            normalized[key] = value;
          }
        });
        normalized.id = normalized.id !== "N/A" ? normalized.id : `temp-${index + 1}`;
        return normalized;
      });
      if (normalizedAll.length === 0) return toast.warn("No data to export.");
      const doc = new jsPDF();
      const cols = allColumnKeys.map(formatColumnName);
      const rows = normalizedAll.map((row) => allColumnKeys.map((key) => String(row[key])));
      autoTable(doc, {
        head: [cols],
        body: rows,
        startY: 20,
        theme: "striped",
        headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
      });
      doc.save("UserManagement.pdf");
      toast.success("Exported to PDF successfully.");
    } catch (err) {
      toast.error("Failed to export to PDF.");
    } finally {
      setIsExporting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">User Management</h2>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">User Management</h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load user data."}
        </p>
      </div>
    );
  }
  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">User Management</h2>
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          {/* <button
            onClick={exportToPDF}
            disabled={isExporting}
            className={isExporting ? styles.button.disabled : styles.button.exportPDF}
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </button> */}
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className={isExporting ? styles.button.disabled : styles.button.exportExcel}
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#103944]"
          >
            <option value="general">General Search</option>
            <option value="user_id">Search by User ID</option>
          </select>
          <input
            placeholder={searchType === "user_id" ? "Enter User ID..." : "Search users..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Trigger search on Enter
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
          />
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            className={styles.button.primary}
          >
            Search
          </button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-200 p-4">
        <table className="min-w-[1800px] w-full text-sm border" role="grid">
          <thead className="bg-[#103944] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit modal, export handlers, pagination – unchanged */}
      {editUser && (
        <div
          onClick={cancelEdit}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-10"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
          >
            <button onClick={cancelEdit} className={styles.button.close}>
              <FaTimes />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[#103944]">View User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allColumnKeys.map(
                (key) =>
                  key !== "id" && (
                    <div key={key} className="flex flex-col">
                      <label
                        className="text-sm font-medium text-gray-700 capitalize"
                        htmlFor={key}
                      >
                        {formatColumnName(key)}
                      </label>
                      {[
                        "paidStatus",
                        "status",
                        "blockStatus",
                        "usdtWithdraw",
                        "roi",
                        "reward",
                      ].includes(key) ? (
                        <select
                          id={key}
                          name={key}
                          value={editUser[key]}
                          onChange={handleEditChange}
                          disabled={
                            key !== "usdtWithdraw" &&
                            key !== "roi" &&
                            key !== "blockStatus" &&
                            key !== "reward"
                          }
                          className={`border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-[#103944] ${getBadgeStyle(
                            editUser[key],
                            key
                          )} ${
                            key !== "usdtWithdraw" &&
                            key !== "roi" &&
                            key !== "blockStatus" &&
                            key !== "reward"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          aria-label={`Edit ${formatColumnName(key)}`}
                        >
                          {key === "paidStatus" && (
                            <>
                              <option value="Paid">Paid</option>
                              <option value="Unpaid">Unpaid</option>
                            </>
                          )}
                          {key === "status" && (
                            <>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </>
                          )}
                          {key === "blockStatus" && (
                            <>
                              <option value="Unblocked">Unblocked</option>
                              <option value="Blocked">Blocked</option>
                            </>
                          )}
                          {(key === "usdtWithdraw" || key === "roi") && (
                            <>
                              <option value="On">On</option>
                              <option value="Off">Off</option>
                            </>
                          )}
                          {key === "reward" && (
                            <>
                              <option value="Reward">Reward</option>
                              <option value="No Reward">No Reward</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <input
                          id={key}
                          type={
                            key === "password"
                              ? "password"
                              : key.includes("Wallet") ||
                                key === "totalEarnings"
                              ? "number"
                              : "text"
                          }
                          name={key}
                          value={editUser[key] ?? ""}
                          onChange={handleEditChange}
                          disabled
                          className="border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-[#103944] opacity-50 cursor-not-allowed"
                          aria-label={`Edit ${formatColumnName(key)}`}
                        />
                      )}
                    </div>
                  )
              )}
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={cancelEdit}
                className={styles.button.secondary}
                aria-label="Cancel editing"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className={
                  isUpdating ? styles.button.disabled : styles.button.primary
                }
                aria-label="Save changes"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-4">
        <span className="text-sm text-gray-600 mr-4">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={table.getCanPreviousPage() ? styles.button.primary : styles.button.disabled}
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={table.getCanNextPage() ? styles.button.primary : styles.button.disabled}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;