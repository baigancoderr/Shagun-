import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 🧩 Dummy referral data
const fullData = [
  { id: 'D201', name: 'Neha', level: 1, plan: 'Premium', joinDate: '2025-07-18' },
  { id: 'D202', name: 'Amit', level: 1, plan: 'Basic', joinDate: '2025-07-19' },
  { id: 'D203', name: 'Sneha', level: 1, plan: 'Standard', joinDate: '2025-07-20' },
  { id: 'D204', name: 'Rahul', level: 1, plan: 'Premium', joinDate: '2025-07-21' },
  { id: 'D205', name: 'Isha', level: 1, plan: 'Basic', joinDate: '2025-07-22' },
  { id: 'D206', name: 'Kunal', level: 1, plan: 'Standard', joinDate: '2025-07-23' },
  { id: 'D207', name: 'Ritika', level: 1, plan: 'Premium', joinDate: '2025-07-24' },
  { id: 'D208', name: 'Varun', level: 1, plan: 'Basic', joinDate: '2025-07-25' },
];

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <div className="text-sm text-secondary">{row.index + 1}</div>,
  },
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('level', {
    header: 'Level',
    cell: info => `Level ${info.getValue()}`,
  }),
  columnHelper.accessor('plan', {
    header: 'Plan',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('joinDate', {
    header: 'Join Date',
    cell: info => info.getValue(),
  }),
];

const DirectReferral = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filteredData = useMemo(() => {
    return planFilter
      ? fullData.filter(row => row.plan === planFilter)
      : fullData;
  }, [planFilter]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DirectReferral');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'direct-referral.xlsx');
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">Direct Referral</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition">
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name or ID..."
          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
        >
          <option value="" className="bg-white text-gray-800">All Plans</option>
          <option value="Basic" className="bg-white text-gray-800">Basic</option>
          <option value="Standard" className="bg-white text-gray-800">Standard</option>
          <option value="Premium" className="bg-white text-gray-800">Premium</option>
        </select>
      </div>

      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="text-left px-4 py-2 border-b border-gray-200 text-blue-700 text-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition text-nowrap">
                {row.getVisibleCells().map(cell => (
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
      </div>

      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >First</button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
          ><FaAngleLeft /></button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
          ><FaAngleRight /></button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >Last</button>
        </div>
      </div>
    </div>
  );
};

export default DirectReferral;
