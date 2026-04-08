import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { appConfig } from '../../../config/appConfig';
import moment from 'moment';
import SkeletonLoader from '../../Components/Comman/Skeletons';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '../../Contexts/DemoModeContext';
import { getDemoData } from '../../Data/demoData';

const columnHelper = createColumnHelper();

const KycSubmitReport = () => {
  const { isDemoMode } = useDemoMode();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Temporary filter states
  const [tempSearch, setTempSearch] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
  };

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['kycHistory', search, startDate, endDate, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found.');

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', currentPage.toString());
      params.append('limit', rowsPerPage.toString());

      const response = await axios.get(
        `${appConfig.baseURL}/user/get-kyc-history?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.data || {};
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: !isDemoMode,
  });

  const rawData = isDemoMode ? getDemoData("kycHistory") : data || {};

  const records = rawData.history || [];
  const pagination = {
    total: rawData.totalRecords || 0,
    totalPages: rawData.totalPages || 1,
  };

  const columns = useMemo(
    () => [
      {
        id: "sno",
        header: "Sr.",
        cell: ({ row }) => (currentPage - 1) * rowsPerPage + row.index + 1,
      },
      columnHelper.accessor('kycId', { header: 'KYC ID' }),
      columnHelper.accessor('firstNameAsPerID', { header: 'First Name' }),
      columnHelper.accessor('lastNameAsPerID', { header: 'Last Name' }),
      columnHelper.accessor('governmentIdType', { header: 'ID Type' }),
      columnHelper.accessor('governmentIdNumber', { header: 'ID Number' }),
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          let color = 'bg-yellow-100 text-yellow-700';
          if (status === 'approved') color = 'bg-green-100 text-green-700';
          if (status === 'rejected') color = 'bg-red-100 text-red-700';

          return (
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${color}`}>
              {status?.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted At',
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format('DD/MM/YYYY hh:mm A')
            : '—',
      },
      {
        accessorKey: 'verifiedAt',
        header: 'Verified At',
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).format('DD/MM/YYYY hh:mm A')
            : '—',
      },
      {
        accessorKey: 'rejectionReason',
        header: 'Rejection Reason',
        cell: (info) => info.getValue() || '—',
      },
    ],
    [currentPage]
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KYC_History');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, `kyc-history-${moment().format('YYYY-MM-DD')}.xlsx`);
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-[#FF6000] font-bold">KYC Submission History</h2>
      <button
  onClick={exportToExcel}
  disabled={isLoading || records.length === 0}
  className="px-5 py-2 h-fit text-base flex items-center justify-center gap-2  border border-[#FF6000]/40 bg-gradient-to-r from-[#FF6000] to-[#E3090D] text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(255,96,0,0.35)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none"
>
  <PiMicrosoftExcelLogo className="text-green-400 text-xl" />
  <span>Export to Excel</span>
</button>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-end">
        <div>
          <label className="text-sm font-medium text-white mb-1 block">Search (Name / ID)</label>
         <input
  type="text"
  value={tempSearch}
  onChange={(e) => setTempSearch(e.target.value)}
  placeholder="Search by name or KYC ID..."
  className="w-full px-4 py-3 bg-transparent text-white border border-gray-400 rounded placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000]"
/>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Start Date</label>
          <input
  type="date"
  value={tempStartDate}
  onChange={(e) => setTempStartDate(e.target.value)}
  className="w-full px-4 py-3 bg-transparent text-white border border-gray-400 rounded transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
  style={{ colorScheme: "dark" }}
/>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">End Date</label>
         <input
  type="date"
  value={tempEndDate}
  onChange={(e) => setTempEndDate(e.target.value)}
  className="w-full px-4 py-3 bg-transparent text-white border border-gray-400 rounded transition-all duration-300 focus:outline-none focus:border-[#FF6000]  focus:ring-1 focus:ring-[#FF6000] [color-scheme:dark]"
  style={{ colorScheme: "dark" }}
/>
        </div>

        <div className="flex justify-end">
         <button
  type="submit"
  className="w-full max-w-[180px] px-6 py-3 bg-gradient-to-r from-[#FF6000] to-[#E3090D] hover:from-[#E3090D] hover:to-[#FF6000] text-white rounded font-medium transition-all duration-300 hover:scale-[1.02]  active:scale-[0.98]"
>
  Apply Filters 
</button>
        </div>
      </form>

      {isError ? (
        <p className="text-center text-red-500 py-12">Failed to load KYC history</p>
      ) : isLoading ? (
        <SkeletonLoader variant="table" rows={8} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#FF6000]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-6 py-4 border-b border-gray-200 font-[400] text-white"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                 <tr
  key={row.id}
  className="border-b border-gray-700 last:border-none transition-all duration-300  hover:text-white"
>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 border-b border-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {records.length === 0 && (
              <p className="text-center text-white py-16">No KYC submissions found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
            <div>
              Page <span className="font-semibold">{currentPage}</span> of {pagination.totalPages} 
              ({pagination.total} records)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isFetching}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isFetching}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || isFetching}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages || isFetching}
                className="px-4 py-2 border rounded disabled:opacity-50"
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

export default KycSubmitReport;