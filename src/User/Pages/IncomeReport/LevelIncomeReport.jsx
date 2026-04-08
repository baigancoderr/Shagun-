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

const LevelIncomeReport = () => {
  const { isDemoMode } = useDemoMode();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Temporary filter states
  const [tempSearch, setTempSearch] = useState('');
  const [tempLevelFilter, setTempLevelFilter] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setLevelFilter(tempLevelFilter);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['levelIncomeReport', search, levelFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found.');

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter) params.append('level', levelFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', currentPage.toString());
      params.append('limit', rowsPerPage.toString());

      const response = await axios.get(
        `${appConfig.baseURL}/user/level-income-reward?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const root = response.data.data || {};
      
      const selfInvestment = Number(root.selfInvestment || 0);
      const teamInvestment = Number(root.teamInvestment || 0);
      const pagination = root.pagination || { total: 0, page: 1, totalPages: 1 };

      // Flatten grouped data (same as before)
      const grouped = root.data || {};
      let totalReward = 0;
      const flattened = Object.values(grouped).flatMap((dateGroup) => {
        totalReward += Number(dateGroup?.totalRewardAmount || 0);
        return (dateGroup?.records || []).map((r) => ({
          sr: r?.sr ?? '',
          level: r?.level ?? '',
          rank: r?.rank ?? '',
          rewardAmount: r?.rewardAmount ?? 0,
          fromUserId: r?.fromUserId ?? '',
          user_id: r?.user_id ?? '',
          distributionDate: r?.distributionDate ?? '',
          investmentAmount: r?.investmentAmount ?? 0,
          levelPlanName: r?.levelPlan?.name ?? '',
          roi: r?.levelPlan?.roi ?? 0,
          strongLeg: r?.levelPlan?.strongLeg ?? 0,
          weakLeg: r?.levelPlan?.weakLeg ?? 0,
          target: r?.levelPlan?.target ?? 0,
          status: 'Credit',
        }));
      });

      return {
        records: flattened,
        selfInvestment,
        teamInvestment,
        totalReward,
        pagination,
      };
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: !isDemoMode,
  });

  const rawData = isDemoMode ? getDemoData("levelIncomeReport") : data || {};
  
  const records = rawData.records || [];
  const pagination = rawData.pagination || { total: 0, page: 1, totalPages: 1 };
  const selfInvestment = Number(rawData.selfInvestment || 0);
  const teamInvestment = Number(rawData.teamInvestment || 0);
  const totalReward = Number(rawData.totalReward || 0);

  const columns = useMemo(
    () => [
      {
        id: "sno",
        header: "Sr.",
        cell: ({ row }) => (currentPage - 1) * rowsPerPage + row.index + 1,
      },
      columnHelper.accessor('user_id', { header: 'User ID' }),
      columnHelper.accessor('fromUserId', { header: 'From User ID' }),
      columnHelper.accessor('investmentAmount', {
        header: 'Invested Amt',
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
      }),
      columnHelper.accessor('level', { header: 'Level' }),
      columnHelper.accessor('rewardAmount', {
        header: 'Reward Amount',
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
      }),
      columnHelper.accessor('distributionDate', {
        header: 'Date',
        cell: (info) =>
          info.getValue()
            ? moment(info.getValue()).utcOffset(330).format('YYYY-MM-DD HH:mm:ss')
            : '—',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              String(info.getValue()).toLowerCase() === 'credit'
                ? 'bg-green-800 text-green-300'
                : 'bg-yellow-800 text-yellow-300'
            }`}
          >
            {String(info.getValue() || 'N/A')}
          </span>
        ),
      }),
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LevelIncomeReport');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'level-income-report.xlsx');
  };

  return (
    <div className="theme-card-style border-gradient text-gray-800 p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-blue-700 font-bold">Level Income Report</h2>
        <button
          onClick={exportToExcel}
          disabled={isLoading || records.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-gray-300 rounded bg-white hover:bg-gray-50 transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow">
          <div className="text-sm text-gray-600">Self Investment</div>
          <div className="text-2xl font-semibold mt-1">${selfInvestment}</div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow">
          <div className="text-sm text-gray-600">Team Investment</div>
          <div className="text-2xl font-semibold mt-1">${teamInvestment}</div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow">
          <div className="text-sm text-gray-600">Total Reward</div>
          <div className="text-2xl font-semibold mt-1">${totalReward.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Search</label>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            placeholder="Search name / ID..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Start Date</label>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">End Date</label>
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
            className="w-full max-w-[150px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Loading next page indicator */}
      {isFetching && !isLoading && <div className="text-center py-4 text-blue-600">Loading next page...</div>}

      {isError ? (
        <p className="text-center text-red-500 py-8">{error?.message}</p>
      ) : isLoading ? (
        <SkeletonLoader variant="table" rows={6} />
      ) : (
        <>
          <div className="overflow-auto rounded">
            <table className="w-full border-collapse text-sm">
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
            </table>

            {table.getRowModel().rows.length === 0 && (
              <p className="text-center text-gray-500 py-8">No data found.</p>
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
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages || isFetching}
                className="px-3 py-1 border text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

export default LevelIncomeReport;