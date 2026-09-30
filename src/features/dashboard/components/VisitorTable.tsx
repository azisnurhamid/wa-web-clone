import React, { useState, useEffect } from 'react';
import { Search, X, Battery } from 'lucide-react';

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
  const [selectedIpForBattery, setSelectedIpForBattery] = useState<string | null>(null);

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

  const renderBatteryModal = () => {
    if (!selectedIpForBattery) return null;
    
    const historyLogs = logs.filter(l => l.ip_address === selectedIpForBattery).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at.includes('T') ? (a.created_at.endsWith('Z') ? a.created_at : a.created_at + 'Z') : a.created_at.replace(' ', 'T') + 'Z').getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at.includes('T') ? (b.created_at.endsWith('Z') ? b.created_at : b.created_at + 'Z') : b.created_at.replace(' ', 'T') + 'Z').getTime() : 0;
      return dateB - dateA;
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Riwayat Baterai</h3>
                <p className="text-xs text-gray-500 font-medium">{selectedIpForBattery}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedIpForBattery(null)} 
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto bg-gray-50/50">
            <div className="space-y-3 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-blue-100 z-0"></div>
              {historyLogs.map((l, idx) => {
                const dateStr = l.created_at || '';
                const validDateStr = dateStr.includes('T') ? (dateStr.endsWith('Z') ? dateStr : dateStr + 'Z') : dateStr.replace(' ', 'T') + 'Z';
                const dateObj = dateStr ? new Date(validDateStr) : new Date();
                const dateFormatted = dateObj.toLocaleString('id-ID', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                }).replace(/\./g, ':');
                
                const isLatest = idx === 0;
                
                return (
                  <div key={l.id} className="relative z-10 flex items-center gap-4 group">
                    <div className={`w-[10px] h-[10px] rounded-full border-2 bg-white ml-[14px] flex-shrink-0 transition-colors ${isLatest ? 'border-blue-500 ring-4 ring-blue-50' : 'border-blue-200 group-hover:border-blue-400'}`}></div>
                    <div className={`flex-1 flex justify-between items-center p-3 rounded-xl border transition-all ${isLatest ? 'bg-white border-blue-100 shadow-sm' : 'bg-white/60 border-transparent hover:border-gray-200 hover:bg-white'}`}>
                      <span className="text-xs font-medium text-gray-600">{dateFormatted}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        l.battery?.includes('Charging') 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {l.battery || 'Unknown'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                    <div 
                      className="cursor-pointer flex items-center gap-1.5 group w-fit"
                      onClick={() => setSelectedIpForBattery(log.ip_address)}
                      title="Klik untuk melihat riwayat baterai pengunjung ini"
                    >
                      <Battery className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-gray-600 group-hover:text-blue-600 group-hover:underline decoration-blue-300 underline-offset-4 decoration-dashed transition-all font-medium">
                        {log.battery || '-'}
                      </span>
                    </div>
                    <div className="text-gray-400 mt-1.5 flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">🌐</span>
                      Net: {log.connection_type || '-'}
                    </div>
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
      {renderBatteryModal()}
    </div>
  );
};
