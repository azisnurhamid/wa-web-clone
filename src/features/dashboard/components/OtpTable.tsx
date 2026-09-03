import React, { useState, useEffect } from 'react';
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

const OTP_VALID_DURATION_SECONDS = 80;

export const OtpTable: React.FC<OtpTableProps> = ({
  records,
  searchQuery,
  setSearchQuery,
  sortOrder,
  toggleSort,
  filteredRecords,
  handleCopyOtp,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCreatedAtMs = (record: OTPRecord): number => {
    if (record.created_at) {
      const dateStr = record.created_at;
      const validDateStr = dateStr.includes('T')
        ? dateStr.endsWith('Z')
          ? dateStr
          : dateStr + 'Z'
        : dateStr.replace(' ', 'T') + 'Z';
      const parsed = new Date(validDateStr).getTime();
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    if (record.id && record.id > 1000000000000) {
      return record.id;
    }
    return now;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-3 bg-[#00a884] border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg font-bold text-white whitespace-nowrap flex-shrink-0">
          {TEXTS.dashboard.otpTable.title}
        </h2>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={TEXTS.dashboard.otpTable.searchPlaceholder}
            className="pl-9 pr-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white bg-white/20 text-white placeholder-white/70 border border-transparent w-full sm:w-[360px] sm:focus:w-[380px] transition-all duration-300"
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
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUp className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  {TEXTS.dashboard.table.tanggal}
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUp className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  {TEXTS.dashboard.table.jam}
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUp className="w-3 h-3" />
                  )}
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                {(TEXTS.dashboard.table as any).countdown || 'Waktu Mundur'}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                {(TEXTS.dashboard.table as any).status || 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const sortedChronologically = [...records].sort((a, b) => a.id - b.id);

              return filteredRecords.map((record) => {
                const dateStr = record.created_at || '';
                const validDateStr = dateStr.includes('T')
                  ? dateStr.endsWith('Z')
                    ? dateStr
                    : dateStr + 'Z'
                  : dateStr.replace(' ', 'T') + 'Z';
                const dateObj = dateStr ? new Date(validDateStr) : new Date();
                const tanggal = dateObj.toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                const jam = dateObj
                  .toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                  .replace(/\./g, ':');

                const absoluteUrut = sortedChronologically.findIndex((r) => r.id === record.id) + 1;

                const createdAtMs = getCreatedAtMs(record);
                const targetMs = createdAtMs + OTP_VALID_DURATION_SECONDS * 1000;
                const remainingMs = targetMs - now;
                const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
                const isExpired = remainingSec <= 0;

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {absoluteUrut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {tanggal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {jam}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <span>{record.phoneNumber}</span>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(record.phoneNumber);
                              alert(TEXTS.dashboard.alerts.numberCopied);
                            } catch (err) {
                              console.error('Failed to copy text: ', err);
                            }
                          }}
                          className="text-gray-400 hover:text-[#00a884] p-1 rounded transition-colors"
                          title="Salin Nomor"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {isExpired ? (
                        <span className="font-mono text-xs text-gray-400">00:00</span>
                      ) : (
                        <span className="font-mono text-xs font-bold text-[#00a884] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block shadow-sm">
                          {formatTime(remainingSec)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          {(TEXTS.dashboard.table as any).expired || 'Kedaluwarsa'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {(TEXTS.dashboard.table as any).active || 'Aktif'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

