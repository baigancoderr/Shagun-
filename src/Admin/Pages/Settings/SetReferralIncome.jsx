import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaFileExcel, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { appConfig } from "../../../config/appConfig";

// Axios instance with baseURL and token
const api = axios.create({
  baseURL: appConfig.baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SetReferralLevels = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [newPercent, setNewPercent] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newType, setNewType] = useState("level");
  const [newLevel, setNewLevel] = useState("");
  const [newCreatePercent, setNewCreatePercent] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all income configs
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/config/income-configs");

      if (res.data?.status === "success") {
        setConfigs(res.data.data || []);
      } else {
        toast.error("Failed to load income configurations");
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Unable to load referral data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return configs;

    const searchLower = search.toLowerCase();
    return configs.filter((item) => {
      return (
        item._id?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower) ||
        (item.level && String(item.level).includes(searchLower)) ||
        String(item.percentage || "").includes(searchLower) ||
        (item.minDirects && String(item.minDirects).includes(searchLower))
      );
    });
  }, [configs, search]);

  const pageCount = Math.ceil(filteredData.length / pagination.pageSize);
  const paginatedData = filteredData.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  // Edit handler
  const handleEdit = (config) => {
    setSelectedConfig(config);
    setNewPercent(config.percentage?.toString() || "");
    setShowUpdateModal(true);
  };

  // Update confirm
  const confirmUpdate = async () => {
    if (!selectedConfig) {
      toast.warn("No configuration selected to update");
      return;
    }

    if (!newPercent.trim()) {
      toast.warn("Please enter a new percentage value");
      return;
    }

    const value = Number(newPercent);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.warn("Percentage must be a number between 0 and 100");
      return;
    }

    try {
      const res = await api.put(`/admin/config/income-config/${selectedConfig._id}`, {
        percentage: value,
      });

      if (res.data?.status === "success") {
        toast.success(
          `Successfully updated ${
            selectedConfig.type === "directReferral" ? "Direct Referral" : `Level ${selectedConfig.level}`
          } to ${value}%`
        );
        setConfigs((prev) =>
          prev.map((item) =>
            item._id === selectedConfig._id ? { ...item, percentage: value } : item
          )
        );
        setShowUpdateModal(false);
        setSelectedConfig(null);
        setNewPercent("");
      } else {
        toast.error("Update failed. Unexpected response from server.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update percentage. Please try again."
      );
    }
  };

  // Show delete confirmation modal
  const handleDelete = (config) => {
    setConfigToDelete(config);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDeleteAction = async () => {
    if (!configToDelete) return;

    try {
      const res = await api.delete(`/admin/config/income-config/${configToDelete._id}`);

      if (res.data?.status === "success") {
        toast.success("Referral configuration deleted successfully");
        setConfigs((prev) => prev.filter((item) => item._id !== configToDelete._id));
      } else {
        toast.error("Delete failed. Unexpected response from server.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete configuration. Please try again."
      );
    } finally {
      setShowDeleteModal(false);
      setConfigToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setConfigToDelete(null);
  };

  // Create
  const handleCreate = async () => {
    if (!newCreatePercent.trim()) {
      toast.warn("Please enter percentage value");
      return;
    }

    const percentValue = Number(newCreatePercent);
    if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
      toast.warn("Percentage must be a number between 0.01 and 100");
      return;
    }

    if (newType === "level") {
      if (!newLevel.trim()) {
        toast.warn("Please enter level number");
        return;
      }
      const levelNum = Number(newLevel);
      if (isNaN(levelNum) || levelNum < 1) {
        toast.warn("Level number must be a positive integer");
        return;
      }
    }

    const payload = {
      type: newType,
      percentage: percentValue,
      ...(newType === "level" && {
        level: Number(newLevel),
        minDirects: Number(newLevel),
      }),
    };

    try {
      const res = await api.post("/admin/config/income-config", payload);

      if (res.data?.status === "success") {
        toast.success(
          newType === "directReferral"
            ? "Direct Referral configuration created successfully"
            : `Level ${newLevel} referral configuration created successfully`
        );
        setShowCreateModal(false);
        setNewType("level");
        setNewLevel("");
        setNewCreatePercent("");
        fetchConfigs();
      } else {
        toast.error("Creation failed. Unexpected response from server.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create new configuration. Please try again."
      );
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (configs.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const exportData = configs.map((item, index) => ({
      "S.No": index + 1,
      ID: item._id,
      Type: item.type,
      Level: item.level ?? "-",
      Percentage: `${item.percentage}%`,
      "Min Directs": item.minDirects ?? "-",
      "Created At": new Date(item.createdAt).toLocaleString(),
      "Updated At": new Date(item.updatedAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Configs");
    XLSX.writeFile(wb, "Income_Configs.xlsx");
    toast.success("Excel file downloaded successfully");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl text-gray-600">
        Loading referral configurations...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#103944]">
          Referral Income Configuration
        </h2>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by ID, type, level..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="border px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#103944]"
          />

          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
            disabled={configs.length === 0}
          >
            <FaFileExcel /> Export
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#103944] hover:bg-[#0d2a35] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#103944] text-white">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold">S.No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Min Directs</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Created At</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Updated At</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No referral configurations found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {pagination.pageIndex * pagination.pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                      {row._id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {row.type}
                      {row.level && <span className="ml-1 text-gray-500">({row.level})</span>}
                    </td>
                    <td className="px-4 py-4 text-center text-green-600 font-medium">
                      {row.percentage}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.minDirects ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(row.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition"
                        title="Edit Configuration"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
                        title="Delete Configuration"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {paginatedData.length} of {filteredData.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.pageIndex === 0}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2 bg-gray-100 rounded font-medium">
              Page {pagination.pageIndex + 1} of {pageCount || 1}
            </span>

            <button
              disabled={pagination.pageIndex + 1 >= pageCount}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              className="px-4 py-2 bg-[#103944] text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#103944]">
              Update Percentage
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {selectedConfig.type === "directReferral"
                  ? "Direct Referral"
                  : `Level ${selectedConfig.level}`}
              </label>
              <div className="text-lg font-semibold text-green-700">
                Current: {selectedConfig.percentage}%
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">New Percentage</label>
              <input
                type="number"
                step="0.01"
                value={newPercent}
                onChange={(e) => setNewPercent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                autoFocus
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedConfig(null);
                  setNewPercent("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                className="px-6 py-2 bg-[#103944] text-white rounded-lg hover:bg-[#0d2a35] transition"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#103944]">
              Create New Referral Config
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                >
                  <option value="level">Level Referral</option>
                  <option value="directReferral">Direct Referral</option>
                </select>
              </div>

              {newType === "level" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Level Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                    placeholder="e.g. 4"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCreatePercent}
                  onChange={(e) => setNewCreatePercent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                  placeholder="e.g. 1.5"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-[#103944] text-white rounded-lg hover:bg-[#0d2a35] transition"
              >
                Create Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && configToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-red-600">
              Confirm Delete
            </h2>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this configuration?
            </p>
            <p className="mb-6 font-medium text-gray-800">
              {configToDelete.type === "directReferral"
                ? "Direct Referral"
                : `Level ${configToDelete.level}`}
            </p>

            <p className="mb-8 text-sm text-red-500">
              This action cannot be undone.
            </p>

            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetReferralLevels;









// import React, { useState, useEffect, useMemo } from "react";
// import { toast } from "react-toastify";
// import * as XLSX from "xlsx";
// import { FaFileExcel, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
// import axios from "axios";
// import { appConfig } from "../../../config/appConfig";

// // Axios instance with baseURL and token interceptor
// const api = axios.create({
//   baseURL: appConfig.baseURL, // or appConfig.apiBaseUrl — jo bhi tumhare config mein hai
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const SetReferralLevels = () => {
//   const [configs, setConfigs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedConfig, setSelectedConfig] = useState(null);
//   const [newPercent, setNewPercent] = useState("");
//   const [showUpdateModal, setShowUpdateModal] = useState(false);

//   // Create modal states
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newType, setNewType] = useState("level");
//   const [newLevel, setNewLevel] = useState("");
//   const [newCreatePercent, setNewCreatePercent] = useState("");

//   const [search, setSearch] = useState("");
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   // Fetch all income configs
//   const fetchConfigs = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/admin/config/income-configs");

//       if (res.data?.status === "success") {
//         setConfigs(res.data.data || []);
//       } else {
//         toast.error("Failed to load income configurations");
//       }
//     } catch (err) {
//       console.error("API Error:", err);
//       toast.error(err?.response?.data?.message || "Error loading data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchConfigs();
//   }, []);

//   // Filtered data with search
//   const filteredData = useMemo(() => {
//     if (!search.trim()) return configs;

//     const searchLower = search.toLowerCase();
//     return configs.filter((item) => {
//       return (
//         item._id?.toLowerCase().includes(searchLower) ||
//         item.type?.toLowerCase().includes(searchLower) ||
//         (item.level && String(item.level).includes(searchLower)) ||
//         String(item.percentage || "").includes(searchLower) ||
//         (item.minDirects && String(item.minDirects).includes(searchLower))
//       );
//     });
//   }, [configs, search]);

//   const pageCount = Math.ceil(filteredData.length / pagination.pageSize);
//   const paginatedData = filteredData.slice(
//     pagination.pageIndex * pagination.pageSize,
//     (pagination.pageIndex + 1) * pagination.pageSize
//   );

//   // Edit
//   const handleEdit = (config) => {
//     setSelectedConfig(config);
//     setNewPercent(config.percentage?.toString() || "");
//     setShowUpdateModal(true);
//   };

//   // Update
//   const confirmUpdate = async () => {
//     if (!selectedConfig) return;

//     const value = Number(newPercent);
//     if (isNaN(value) || value < 0 || value > 100) {
//       return toast.error("Percentage should be between 0 and 100");
//     }

//     try {
//       const res = await api.put(`/admin/config/income-config/${selectedConfig._id}`, {
//         percentage: value,
//       });

//       if (res.data?.status === "success") {
//         toast.success("Updated successfully");
//         setConfigs((prev) =>
//           prev.map((item) =>
//             item._id === selectedConfig._id ? { ...item, percentage: value } : item
//           )
//         );
//         setShowUpdateModal(false);
//         setSelectedConfig(null);
//         setNewPercent("");
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update");
//     }
//   };

//   // Delete
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this config?")) return;

//     try {
//       const res = await api.delete(`/admin/config/income-config/${id}`);

//       if (res.data?.status === "success") {
//         toast.success("Deleted successfully");
//         setConfigs((prev) => prev.filter((item) => item._id !== id));
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to delete");
//     }
//   };

//   // Create
//   const handleCreate = async () => {
//     if (!newCreatePercent.trim()) return toast.error("Percentage is required");

//     const percentValue = Number(newCreatePercent);
//     if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
//       return toast.error("Enter valid percentage (0.01 to 100)");
//     }

//     if (newType === "level" && (!newLevel || Number(newLevel) < 1)) {
//       return toast.error("Please enter valid level number");
//     }

//     const payload = {
//       type: newType,
//       percentage: percentValue,
//       ...(newType === "level" && {
//         level: Number(newLevel),
//         minDirects: Number(newLevel),
//       }),
//     };

//     try {
//       const res = await api.post("/admin/config/income-config", payload);

//       if (res.data?.status === "success") {
//         toast.success("New config created successfully");
//         setShowCreateModal(false);
//         setNewType("level");
//         setNewLevel("");
//         setNewCreatePercent("");
//         fetchConfigs();
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to create");
//     }
//   };

//   // Excel Export
//   const exportToExcel = () => {
//     if (configs.length === 0) {
//       toast.info("No data to export");
//       return;
//     }

//     const exportData = configs.map((item, index) => ({
//       "S.No": index + 1,
//       ID: item._id,
//       Type: item.type,
//       Level: item.level ?? "-",
//       Percentage: `${item.percentage}%`,
//       "Min Directs": item.minDirects ?? "-",
//       "Created At": new Date(item.createdAt).toLocaleString(),
//       "Updated At": new Date(item.updatedAt).toLocaleString(),
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Income Configs");
//     XLSX.writeFile(wb, "Income_Configs.xlsx");
//   };

//   if (loading) {
//     return (
//       <div className="p-10 text-center text-xl text-gray-600">
//         Loading income configurations...
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-full mx-auto">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <h2 className="text-2xl md:text-3xl font-bold text-[#103944]">
//           Referral Income Configuration
//         </h2>

//         <div className="flex flex-wrap gap-3">
//           <input
//             type="text"
//             placeholder="Search by ID, type, level..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPagination((prev) => ({ ...prev, pageIndex: 0 }));
//             }}
//             className="border px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#103944]"
//           />

//           <button
//             onClick={exportToExcel}
//             className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
//             disabled={configs.length === 0}
//           >
//             <FaFileExcel /> Export
//           </button>

//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="bg-[#103944] hover:bg-[#0d2a35] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
//           >
//             <FaPlus /> Add New
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white shadow rounded-lg overflow-hidden border">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-[#103944] text-white">
//               <tr>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">S.No</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">Min Directs</th>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">Created At</th>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">Updated At</th>
//                 <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {paginatedData.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
//                     No records found
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedData.map((row, idx) => (
//                   <tr key={row._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-4 text-center whitespace-nowrap">
//                       {pagination.pageIndex * pagination.pageSize + idx + 1}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-600 font-mono">
//                       {row._id.substring(0, 8)}...
//                     </td>
//                     <td className="px-4 py-4 text-sm">
//                       {row.type}
//                       {row.level && <span className="ml-1 text-gray-500">({row.level})</span>}
//                     </td>
//                     <td className="px-4 py-4 text-center text-green-600 font-medium">
//                       {row.percentage}%
//                     </td>
//                     <td className="px-4 py-4 text-center">
//                       {row.minDirects ?? "-"}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-600">
//                       {new Date(row.createdAt).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-600">
//                       {new Date(row.updatedAt).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-4 text-center whitespace-nowrap space-x-2">
//                       <button
//                         onClick={() => handleEdit(row)}
//                         className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition"
//                         title="Edit"
//                       >
//                         <FaEdit className="inline" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(row._id)}
//                         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
//                         title="Delete"
//                       >
//                         <FaTrash className="inline" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t">
//           <div className="text-sm text-gray-600">
//             Showing {paginatedData.length} of {filteredData.length} entries
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               disabled={pagination.pageIndex === 0}
//               onClick={() =>
//                 setPagination((prev) => ({
//                   ...prev,
//                   pageIndex: prev.pageIndex - 1,
//                 }))
//               }
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Prev
//             </button>

//             <span className="px-4 py-2 bg-gray-100 rounded font-medium">
//               Page {pagination.pageIndex + 1} of {pageCount || 1}
//             </span>

//             <button
//               disabled={pagination.pageIndex + 1 >= pageCount}
//               onClick={() =>
//                 setPagination((prev) => ({
//                   ...prev,
//                   pageIndex: prev.pageIndex + 1,
//                 }))
//               }
//               className="px-4 py-2 bg-[#103944] text-white rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Update Modal */}
//       {showUpdateModal && selectedConfig && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
//             <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#103944]">
//               Update Percentage
//             </h2>

//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-2">
//                 {selectedConfig.type === "directReferral"
//                   ? "Direct Referral"
//                   : `Level ${selectedConfig.level}`}
//               </label>
//               <div className="text-lg font-semibold text-green-700">
//                 Current: {selectedConfig.percentage}%
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-2">New Percentage</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={newPercent}
//                 onChange={(e) => setNewPercent(e.target.value)}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
//                 autoFocus
//               />
//             </div>

//             <div className="flex gap-4 justify-end">
//               <button
//                 onClick={() => {
//                   setShowUpdateModal(false);
//                   setSelectedConfig(null);
//                 }}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmUpdate}
//                 className="px-6 py-2 bg-[#103944] text-white rounded-lg hover:bg-[#0d2a35] transition"
//               >
//                 Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
//             <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#103944]">
//               Create New Referral Config
//             </h2>

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Type</label>
//                 <select
//                   value={newType}
//                   onChange={(e) => setNewType(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
//                 >
//                   <option value="level">Level Referral</option>
//                   <option value="directReferral">Direct Referral</option>
//                 </select>
//               </div>

//               {newType === "level" && (
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Level Number</label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={newLevel}
//                     onChange={(e) => setNewLevel(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
//                     placeholder="e.g. 4"
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium mb-2">Percentage</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={newCreatePercent}
//                   onChange={(e) => setNewCreatePercent(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103944]"
//                   placeholder="e.g. 1.5"
//                 />
//               </div>
//             </div>

//             <div className="mt-8 flex gap-4 justify-end">
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreate}
//                 className="px-6 py-2 bg-[#103944] text-white rounded-lg hover:bg-[#0d2a35] transition"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SetReferralLevels;





