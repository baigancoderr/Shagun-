import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight, FaEye, FaCheck, FaTimes } from "react-icons/fa";

const KycReport = () => {
  const queryClient = useQueryClient();

  const [userIdFilter, setUserIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [userIdInput, setUserIdInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch Data
  const { 
    data: apiResponse = { history: [], totalPages: 1, totalRecords: 0 }, 
    isFetching, 
    isError 
  } = useQuery({
    queryKey: ["kycReport", pagination.pageIndex, userIdFilter, startDate, endDate, statusFilter],
    queryFn: async () => {
      const pageNum = pagination.pageIndex + 1;
      const res = await adminApi.getAllKYC(pageNum, 10, startDate, endDate, userIdFilter, statusFilter);
      return {
        history: res?.data?.history || [],
        totalPages: res?.data?.totalPages || 1,
        totalRecords: res?.data?.totalRecords || 0,
      };
    },
    refetchOnWindowFocus: false,
  });

  const kycRecords = apiResponse.history;

  const { mutate: verifyKYC, isPending: isUpdating } = useMutation({
    mutationFn: ({ kycId, status, rejectionReason }) =>
      adminApi.verifyKYC(kycId, status, rejectionReason),
    onSuccess: (_, { status }) => {
      toast.success(`KYC ${status === "approved" ? "Approved" : "Rejected"} successfully!`);
      queryClient.invalidateQueries(["kycReport"]);
      setSelectedKyc(null);
      setShowRejectModal(false);
      setRejectionReason("");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update status"),
  });

  const columns = useMemo(() => [
    { accessorKey: "sr", header: "Sr No.", cell: ({ row }) => pagination.pageIndex * 10 + row.index + 1 },
    { accessorKey: "user.user_id", header: "User ID" },
    { accessorKey: "firstNameAsPerID", header: "First Name" },
    { accessorKey: "lastNameAsPerID", header: "Last Name" },
    { accessorKey: "governmentIdType", header: "ID Type" },
    { accessorKey: "governmentIdNumber", header: "ID Number" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        const color = status === "approved" ? "bg-green-100 text-green-700" : 
                      status === "rejected" ? "bg-red-100 text-red-700" : 
                      "bg-yellow-100 text-yellow-700";
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{status?.toUpperCase()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const kyc = row.original;
        return (
          <div className="flex gap-2">
            <button onClick={() => setSelectedKyc(kyc)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
              <FaEye /> View
            </button>
            {kyc.status === "pending" && (
              <>
                <button onClick={() => verifyKYC({ kycId: kyc._id, status: "approved" })} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
                  <FaCheck /> Approve
                </button>
                <button onClick={() => { setSelectedKyc(kyc); setShowRejectModal(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
                  <FaTimes /> Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ], [pagination.pageIndex, isUpdating]);

  const table = useReactTable({
    data: kycRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: apiResponse.totalPages,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  const handleSearch = () => {
    setUserIdFilter(userIdInput.trim());
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  if (isError) return <div className="p-8 text-red-600 text-center">Error loading KYC data. Please try again.</div>;

  const startEntry = pagination.pageIndex * 10 + 1;
  const endEntry = Math.min((pagination.pageIndex + 1) * 10, apiResponse.totalRecords);

  return (
    <div className="p-4 max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#103944]">KYC Management</h2>

      {/* Filters - Fully Responsive */}
      <div className="mb-6 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">User ID</label>
            <input type="text" value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder="URWA00001" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} className="w-full bg-[#103944] hover:bg-[#0e2a3d] text-white py-3 rounded-xl text-sm font-medium">Search</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto bg-white rounded-3xl shadow border">
        {isFetching && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-3xl">
            <div className="flex items-center gap-3 text-[#103944] font-medium">
              <div className="w-6 h-6 border-4 border-[#103944] border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </div>
        )}
        <table className="min-w-full text-sm">
          <thead className="bg-[#103944] text-white sticky top-0">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th key={header.id} className="p-4 text-left font-medium whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {kycRecords.length === 0 && !isFetching ? (
              <tr><td colSpan={7} className="p-20 text-center text-gray-500">No KYC records found</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 border-b last:border-none">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
        <div className="text-gray-600">
          Showing {startEntry} to {endEntry} of {apiResponse.totalRecords} entries
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))} disabled={pagination.pageIndex === 0} className="px-5 py-2 border rounded-xl disabled:opacity-50">First</button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(p.pageIndex - 1, 0) }))} disabled={pagination.pageIndex === 0} className="px-5 py-2 border rounded-xl disabled:opacity-50"><FaAngleLeft /></button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))} disabled={pagination.pageIndex + 1 >= apiResponse.totalPages} className="px-5 py-2 border rounded-xl disabled:opacity-50"><FaAngleRight /></button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(apiResponse.totalPages - 1, 0) }))} disabled={pagination.pageIndex + 1 >= apiResponse.totalPages} className="px-5 py-2 border rounded-xl disabled:opacity-50">Last</button>
        </div>
      </div>

      {/* ==================== RESPONSIVE VIEW MODAL ==================== */}
      {selectedKyc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-full md:max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <h3 className="text-2xl font-semibold">KYC Details</h3>
              <button onClick={() => setSelectedKyc(null)} className="text-4xl text-gray-400 hover:text-black leading-none">×</button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              {/* User Info + Status */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs text-gray-500 tracking-widest">USER ID</p>
                  <p className="text-3xl font-semibold text-[#103944]">{selectedKyc.user?.user_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 tracking-widest mb-1">STATUS</p>
                  <span className={`inline-block px-8 py-2 text-sm font-semibold rounded-full ${
                    selectedKyc.status === "approved" ? "bg-green-100 text-green-700" : 
                    selectedKyc.status === "rejected" ? "bg-red-100 text-red-700" : 
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {selectedKyc.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm">
                <div>
                  <p className="text-xs text-gray-500">NAME AS PER ID</p>
                  <p className="font-semibold text-lg mt-1">{selectedKyc.firstNameAsPerID} {selectedKyc.lastNameAsPerID}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DATE OF BIRTH</p>
                  <p className="font-semibold text-lg mt-1">
                    {selectedKyc.dateOfBirthAsPerID ? new Date(selectedKyc.dateOfBirthAsPerID).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">ADDRESS</p>
                  <p className="font-semibold text-lg mt-1">{selectedKyc.addressAsPerID || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ID TYPE</p>
                  <p className="font-semibold text-lg mt-1">{selectedKyc.governmentIdType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ID NUMBER</p>
                  <p className="font-semibold text-lg mt-1">{selectedKyc.governmentIdNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">SUBMITTED AT</p>
                  <p className="font-semibold text-lg mt-1">{new Date(selectedKyc.submittedAt).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-12">
                <h4 className="font-semibold text-lg mb-6">Uploaded Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedKyc.governmentIdFront && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-3">GOVERNMENT ID FRONT</p>
                      <a href={selectedKyc.governmentIdFront} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 transition-all">
                        <img src={selectedKyc.governmentIdFront} alt="ID Front" className="w-full aspect-video object-cover" />
                      </a>
                    </div>
                  )}
                  {selectedKyc.governmentIdBack && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-3">GOVERNMENT ID BACK</p>
                      <a href={selectedKyc.governmentIdBack} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 transition-all">
                        <img src={selectedKyc.governmentIdBack} alt="ID Back" className="w-full aspect-video object-cover" />
                      </a>
                    </div>
                  )}
                  {selectedKyc.signatureImage && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-3">SIGNATURE IMAGE</p>
                      <a href={selectedKyc.signatureImage} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 transition-all">
                        <img src={selectedKyc.signatureImage} alt="Signature" className="w-full aspect-video object-cover" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clear & Responsive Action Buttons */}
            {selectedKyc.status === "pending" && (
              <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => verifyKYC({ kycId: selectedKyc._id, status: "approved" })}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <FaCheck className="text-2xl" /> Approve KYC
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <FaTimes className="text-2xl" /> Reject KYC
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Reject KYC</h3>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 border border-gray-300 rounded-2xl font-medium">Cancel</button>
              <button
                onClick={() => rejectionReason.trim() ? verifyKYC({ kycId: selectedKyc._id, status: "rejected", rejectionReason }) : toast.error("Please enter reason")}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-medium hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycReport;