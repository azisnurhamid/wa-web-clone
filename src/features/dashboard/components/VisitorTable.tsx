import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export interface VisitorLog {
  id: number;
  ip_address: string;
  user_agent: string;
  os: string;
  browser: string;
  device_type: string;
  screen_resolution: string;
  language: string;
  timezone: string;
  connection_type: string;
  created_at: string;
  cpu_cores?: string;
  ram?: string;
  gpu?: string;
  battery?: string;
  touch_support?: string;
  referrer?: string;
  visibility?: string;
  dark_mode?: string;
}

export const VisitorTable: React.FC = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/visitors');
        const data = await response.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (e) {
        console.error('Failed to fetch visitor logs', e);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
      (log.os && log.os.toLowerCase().includes(q)) ||
      (log.browser && log.browser.toLowerCase().includes(q)) ||
      (log.device_type && log.device_type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-3 bg-[#00a884] border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg font-bold text-white whitespace-nowrap flex-shrink-0">
          Log Pengunjung
        </h2>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari IP, Browser, atau OS"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Device / OS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Browser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Spesifikasi Hardware</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Baterai & Jaringan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Lainnya (Ref/Tema)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">Lokasi / Waktu</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log, index) => {
              const dateStr = log.created_at || '';
              const validDateStr = dateStr.includes('T')
                ? dateStr.endsWith('Z')
                  ? dateStr
                  : dateStr + 'Z'
                : dateStr.replace(' ', 'T') + 'Z';
              const dateObj = dateStr ? new Date(validDateStr) : new Date();
              const dateFormatted = dateObj.toLocaleString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }).replace(/\./g, ':');

              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dateFormatted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.ip_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.device_type} / {log.os}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.browser}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                    <div>Layar: {log.screen_resolution} {log.touch_support === 'Yes' ? '(Touch)' : ''}</div>
                    <div className="text-gray-400 mt-0.5" title={log.gpu}>CPU: {log.cpu_cores || '-'} | RAM: {log.ram || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                    <div>Bat: {log.battery || '-'}</div>
                    <div className="text-gray-400 mt-0.5">Net: {log.connection_type || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                    <div className="truncate max-w-[150px]" title={log.referrer}>Ref: {log.referrer === 'Direct' || !log.referrer ? 'Direct' : log.referrer}</div>
                    <div className="text-gray-400 mt-0.5">Tema {log.dark_mode || '-'} | Vis: {log.visibility || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                    <div>{log.timezone}</div>
                    <div className="text-gray-400 mt-0.5">{log.language}</div>
                  </td>
                </tr>
              );
            })}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data pengunjung
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
