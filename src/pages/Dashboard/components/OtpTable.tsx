import React from 'react';
import { Search, ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { TEXTS } from '../../../config/config';
import { OTPRecord } from '../../../types';

interface OtpTableProps {
  records: OTPRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: 'desc' | 'asc';
  toggleSort: () => void;
  filteredRecords: OTPRecord[];
  handleCopyOtp: (otp: string) => void;
}

export const OtpTable: React.FC<OtpTableProps> = ({
  records,
  searchQuery,
  setSearchQuery,
  sortOrder,
  toggleSort,
  filteredRecords,
  handleCopyOtp
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-3 bg-[#00a884] border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Data OTP Masuk</h2>
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No/OTP/Negara..."
            className="pl-9 pr-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white bg-white/20 text-white placeholder-white/70 border border-transparent w-48 focus:w-64 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  {TEXTS.dashboard.table.no}
                  {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  {TEXTS.dashboard.table.tanggal}
                  {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  {TEXTS.dashboard.table.jam}
                  {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                {TEXTS.dashboard.table.phone}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                {TEXTS.dashboard.table.country}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                {TEXTS.dashboard.table.otp}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => {
              const dateObj = new Date(record.id);
              const tanggal = dateObj.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              const jam = dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }).replace(/\./g, ':');
              
              return (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  {records.indexOf(record) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {tanggal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {jam}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {record.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {record.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 font-semibold tracking-widest flex items-center justify-center gap-3">
                  <span>{record.otp}</span>
                  <button 
                    onClick={() => handleCopyOtp(record.otp)}
                    className="text-gray-400 hover:text-[#00a884] p-1 rounded transition-colors"
                    title="Salin OTP"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
