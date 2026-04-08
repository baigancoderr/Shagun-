import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { FaAngleLeft, FaAngleRight, FaCopy } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { appConfig } from '../../config/appConfig';
import SkeletonLoader from '../Components/Comman/Skeletons';
import { useDemoMode } from '../Contexts/DemoModeContext';
import { getDemoData } from '../Data/demoData';

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => (
      <div className="text-left text-sm text-secondary">{row.index + 1}</div>
    ),
  },
  columnHelper.accessor('transactionHash', {
    header: 'Transaction Hash',
    cell: ({ getValue }) => {
      const hash = getValue() || 'N/A';
      const shortHash = hash !== 'N/A' ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'N/A';
      const fullHash = getValue() || '';
      const copyToClipboard = () => {
        navigator.clipboard.writeText(fullHash);
        toast.success('Transaction hash copied!', {
          icon: <FaCopy className="text-blue-700" />,
          autoClose: 2000,
        });
      };
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">{shortHash}</span>
          {hash !== 'N/A' && (
            <button
              onClick={copyToClipboard}
              className="text-sky-400 hover:text-sky-300 text-sm"
              title="Copy transaction hash"
            >
              <FaCopy />
            </button>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('currencyType', {
    header: 'Currency Type',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `$${info.getValue() || 0}`,
  }),
  columnHelper.accessor('walletType', {
    header: 'Wallet Type',
    cell: (info) => info.getValue() || 'Unknown',
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue() || 'N/A',
  }),
];

// API fetch
const fetchDeposits = async () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found. Please log in.');

  const response = await axios.get(`${appConfig.baseURL}/user/userDeposits`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const apiDeposits = response.data.data.deposits || [];
  return apiDeposits.map((deposit) => ({
    id: deposit._id,
    transactionHash: deposit.transactionHash || 'N/A',
    amount: deposit.amount,
    walletType: deposit.walletType,
    currencyType: deposit.currencyType || 'Unknown',
    date: moment(deposit.createdAt).utcOffset(330).format('YYYY-MM-DD HH:mm:ss'),
    status: deposit.status || 'Pending',
  }));
};

const DepositReport = () => {
  const { isDemoMode } = useDemoMode();

  // Final applied filters
  const [search, setSearch] = useState('');
  const [walletType, setWalletType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Temporary form values
  const [tempSearch, setTempSearch] = useState('');
  const [tempWallet, setTempWallet] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data: apiDeposits = [], isLoading, isError, error } = useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isDemoMode,
  });

  const displayData = isDemoMode ? getDemoData("depositReport") || [] : apiDeposits;

  const filteredData = useMemo(() => {
    let result = [...displayData];

    // Wallet filter
    if (walletType) {
      result = result.filter((row) => row.walletType === walletType);
    }

    // Search filter
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (row) =>
          (row.transactionHash || '').toLowerCase().includes(lower) ||
          (row.currencyType || '').toLowerCase().includes(lower) ||
          (row.walletType || '').toLowerCase().includes(lower) ||
          (row.status || '').toLowerCase().includes(lower)
      );
    }

    // Date range filter
    if (startDate) {
      const start = moment(startDate).startOf('day');
      result = result.filter((row) => moment(row.date).isSameOrAfter(start));
    }
    if (endDate) {
      const end = moment(endDate).endOf('day');
      result = result.filter((row) => moment(row.date).isSameOrBefore(end));
    }

    return result;
  }, [displayData, search, walletType, startDate, endDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setWalletType(tempWallet);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DepositReport');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), 'deposit-report.xlsx');
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">Deposit Report</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleApplyFilter}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-end"
      >
        <div>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            placeholder="Search hash, currency, wallet, status..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <select
            value={tempWallet}
            onChange={(e) => setTempWallet(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Wallets</option>
            <option value="Principle">Principle Wallet</option>
            <option value="My Wallet">My Wallet</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
          >
            Apply Filter
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          {isLoading && !isDemoMode ? (
            <SkeletonLoader variant="table" />
          ) : isError && !isDemoMode ? (
            <p className="text-red-500 p-4">{error?.message || 'Failed to load data'}</p>
          ) : (
            <>
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
            </>
          )}
        </table>

        {table.getRowModel().rows.length === 0 && !isLoading && (
          <p className="text-center text-sm text-gray-500 mt-4">No data found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositReport;


// // import React, { useState, useMemo } from 'react';
// import React, { useState, useMemo, useEffect } from 'react';

// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   flexRender,
//   createColumnHelper,
// } from '@tanstack/react-table';
// import { useQuery } from '@tanstack/react-query';
// import { FaAngleLeft, FaAngleRight, FaCopy } from 'react-icons/fa';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { PiMicrosoftExcelLogo } from 'react-icons/pi';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import moment from 'moment';
// import { appConfig } from '../../config/appConfig';
// import SkeletonLoader from '../Components/Comman/Skeletons';
// import { useDemoMode } from '../Contexts/DemoModeContext';
// import { getDemoData } from '../Data/demoData';

// const columnHelper = createColumnHelper();


// const columns = [
//   {
//     id: 'sno',
//     header: 'S.No',
//     cell: ({ row }) => (
//       <div className="text-left text-sm text-secondary">{row.index + 1}</div>
//     ),
//   },
//   columnHelper.accessor('transactionHash', {
//     header: 'Transaction Hash',
//     cell: ({ getValue }) => {
//       const hash = getValue() || 'N/A';
//       const shortHash =
//         hash !== 'N/A' ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'N/A';
//       const fullHash = getValue() || '';

//       const copyToClipboard = () => {
//         navigator.clipboard.writeText(fullHash);
//         toast.success('Transaction hash copied to clipboard!', {
//           icon: <FaCopy className="text-blue-700" />,
//           autoClose: 2000,
//         });
//       };

//       return (
//         <div className="flex items-center gap-2">
//           <span className="text-sm truncate">{shortHash}</span>
//           {hash !== 'N/A' && (
//             <button
//               onClick={copyToClipboard}
//               className="text-sky-400 hover:text-sky-300 text-sm"
//               title="Copy transaction hash"
//             >
//               <FaCopy />
//             </button>
//           )}
//         </div>
//       );
//     },
//   }),
//   columnHelper.accessor('currencyType', {
//     header: 'Currency Type',
//     cell: (info) => info.getValue() || 'N/A',
//   }),
//   columnHelper.accessor('amount', {
//     header: 'Amount',
//     cell: (info) => `$${info.getValue() || 0}`,
//   }),
//   columnHelper.accessor('walletType', {
//     header: 'Wallet Type',
//     cell: (info) => info.getValue() || 'Unknown',
//   }),
//   columnHelper.accessor('date', {
//     header: 'Date',
//     cell: (info) => info.getValue() || 'N/A',
//   }),
//   columnHelper.accessor('status', {
//     header: 'Status',
//     cell: (info) => info.getValue() || 'N/A',
//   }),
// ];




// // 🔹 API call wrapped for React Query
// const fetchDeposits = async () => {
//   const token =
//     localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//   if (!token) {
//     throw new Error('No authentication token found. Please log in.');
//   }

//   const response = await axios.get(`${appConfig.baseURL}/user/userDeposits`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const apiDeposits = response.data.data.deposits;

//   return apiDeposits.map((deposit) => ({
//     id: deposit._id,
//     transactionHash: deposit.transactionHash || 'N/A',
//     amount: deposit.amount,
//     walletType: deposit.walletType,
//     currencyType: deposit.currencyType || 'Unknown',
//     date: moment(deposit.createdAt).utcOffset(330).format('YYYY-MM-DD HH:mm:ss'),
//     status: deposit.status || 'Pending',
//   }));
// };

// const DepositReport = () => {
//   const { isDemoMode } = useDemoMode();
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [walletFilter, setWalletFilter] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   useEffect(() => {
//     setPagination((prev) => ({
//       ...prev,
//       pageIndex: 0,
//     }));
//   }, [globalFilter, walletFilter, startDate, endDate]);

//   // }, [globalFilter, walletFilter]);



//   // ✅ TanStack Query hook
//   const {
//     data: deposits = [],
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ['deposits'],
//     queryFn: fetchDeposits,
//     staleTime: 1000 * 60 * 2, // data considered fresh for 2 min
//     cacheTime: 1000 * 60 * 5, // cache kept for 5 min
//     refetchOnWindowFocus: false,
//     enabled: !isDemoMode, // Disable API call in demo mode
//   });

//   // Use demo data if demo mode is active
//   const displayDeposits = isDemoMode ? getDemoData("depositReport") : deposits;

//   // 🔹 Filtered data

//   const filteredData = useMemo(() => {
//     let data = displayDeposits;

//     if (walletFilter) {
//       data = data.filter((row) => row.walletType === walletFilter);
//     }

//     if (globalFilter) {
//       data = data.filter(
//         (row) =>
//           row.transactionHash?.toLowerCase().includes(globalFilter.toLowerCase()) ||
//           row.currencyType?.toLowerCase().includes(globalFilter.toLowerCase()) ||
//           row.walletType?.toLowerCase().includes(globalFilter.toLowerCase()) ||
//           row.status?.toLowerCase().includes(globalFilter.toLowerCase())
//       );
//     }

//     if (startDate) {
//       data = data.filter((row) =>
//         moment(row.date).isSameOrAfter(moment(startDate))
//       );
//     }

//     if (endDate) {
//       data = data.filter((row) =>
//         moment(row.date).isSameOrBefore(moment(endDate))
//       );
//     }

//     return data;
//   }, [walletFilter, globalFilter, startDate, endDate, displayDeposits]);



//   // const filteredData = useMemo(() => {
//   //   let data = displayDeposits;
//   //   if (walletFilter) {
//   //     data = data.filter((row) => row.walletType === walletFilter);
//   //   }
//   //   if (globalFilter) {
//   //     data = data.filter(
//   //       (row) =>
//   //         row.transactionHash
//   //           .toLowerCase()
//   //           .includes(globalFilter.toLowerCase()) ||
//   //         row.currencyType.toLowerCase().includes(globalFilter.toLowerCase()) ||
//   //         row.walletType.toLowerCase().includes(globalFilter.toLowerCase()) ||
//   //         row.status.toLowerCase().includes(globalFilter.toLowerCase())
//   //     );
//   //   }
//   //   return data;
//   // }, [walletFilter, globalFilter, displayDeposits]);

//   // }, [walletFilter, globalFilter, deposits]);

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       globalFilter,
//       pagination,
//     },
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   // Excel export
//   const exportToExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(filteredData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'DepositReport');
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: 'xlsx',
//       type: 'array',
//     });
//     const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
//     saveAs(data, 'deposit-report.xlsx');
//   };

//   return (
//     <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
//       <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
//         <h2 className="text-2xl text-blue-700 font-bold">Deposit Report</h2>
//         <button
//           onClick={exportToExcel}
//           className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition"
//         >
//           <PiMicrosoftExcelLogo className="text-green-600" /> <span>Export</span>
//         </button>
//       </div>

//       {/* Search & Filter */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6">
//         <input
//           type="text"
//           value={globalFilter ?? ''}
//           onChange={(e) => setGlobalFilter(e.target.value)}
//           placeholder="Search transaction hash, currency, wallet, or status..."
//           className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
//         />
//         <select
//           value={walletFilter}
//           onChange={(e) => setWalletFilter(e.target.value)}
//           className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
//         >
//           <option value="" className="bg-white text-gray-800">
//             All Wallets
//           </option>
//           <option value="Principle" className="bg-white text-gray-800">
//             Principle Wallet
//           </option>
//           <option value="My Wallet" className="bg-white text-gray-800">
//             My Wallet
//           </option>
//         </select>
//         <input
//           type="date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
//         />

//         <input
//           type="date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
//         />

//       </div>

//       {/* Table */}
//       <div className="overflow-auto rounded">
//         <table className="w-full border-collapse text-sm">
//           {isLoading && !isDemoMode ? (
//             <SkeletonLoader variant="table" />
//           ) : isError && !isDemoMode ? (
//             <p className="text-red-500 p-4">{error.message}</p>
//           ) : (
//             <>
//               <thead className="bg-gray-50">
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <tr key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <th
//                         key={header.id}
//                         className="text-left px-4 py-2 border-b border-gray-200 text-blue-700 text-nowrap"
//                       >
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                       </th>
//                     ))}
//                   </tr>
//                 ))}
//               </thead>
//               <tbody>
//                 {table.getRowModel().rows.map((row) => (
//                   <tr
//                     key={row.id}
//                     className="hover:bg-gray-50 transition text-nowrap"
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td
//                         key={cell.id}
//                         className="px-4 py-2 border-b border-gray-200"
//                       >
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </>
//           )}
//         </table>

//         {table.getRowModel().rows.length === 0 && !isLoading && (
//           <p className="text-center text-sm text-gray-500 mt-4">No data found.</p>
//         )}
//       </div>

//       {/* Pagination Controls */}
//       <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
//         <div className="text-secondary">
//           Page {table.getState().pagination.pageIndex + 1} of{' '}
//           {table.getPageCount()}
//         </div>
//         <div className="space-x-2 flex">
//           <button
//             onClick={() => table.setPageIndex(0)}
//             disabled={!table.getCanPreviousPage()}
//             className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             First
//           </button>
//           <button
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             <FaAngleLeft />
//           </button>
//           <button
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             <FaAngleRight />
//           </button>
//           <button
//             onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//             disabled={!table.getCanNextPage()}
//             className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             Last
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepositReport;
