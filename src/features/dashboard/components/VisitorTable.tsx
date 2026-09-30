import React, { useState, useEffect } from 'react';
import { Search, X, Battery, Copy, MapPin } from 'lucide-react';

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

  const translateRegion = (region: string) => {
    if (!region) return '-';
    const map: Record<string, string> = {
      'Central Java': 'Jawa Tengah',
      'West Java': 'Jawa Barat',
      'East Java': 'Jawa Timur',
      'Jakarta': 'DKI Jakarta',
      'Jakarta Raya': 'DKI Jakarta',
      'Special Capital Region of Jakarta': 'DKI Jakarta',
      'North Sumatra': 'Sumatera Utara',
      'South Sumatra': 'Sumatera Selatan',
      'West Sumatra': 'Sumatera Barat',
      'North Sulawesi': 'Sulawesi Utara',
      'South Sulawesi': 'Sulawesi Selatan',
      'Central Sulawesi': 'Sulawesi Tengah',
      'Southeast Sulawesi': 'Sulawesi Tenggara',
      'West Sulawesi': 'Sulawesi Barat',
      'West Kalimantan': 'Kalimantan Barat',
      'Central Kalimantan': 'Kalimantan Tengah',
      'South Kalimantan': 'Kalimantan Selatan',
      'East Kalimantan': 'Kalimantan Timur',
      'North Kalimantan': 'Kalimantan Utara',
      'West Nusa Tenggara': 'Nusa Tenggara Barat',
      'East Nusa Tenggara': 'Nusa Tenggara Timur',
      'North Maluku': 'Maluku Utara',
      'West Papua': 'Papua Barat',
      'South Papua': 'Papua Selatan',
      'Central Papua': 'Papua Tengah',
      'Highland Papua': 'Papua Pegunungan',
      'Southwest Papua': 'Papua Barat Daya',
      'Yogyakarta': 'DI Yogyakarta',
      'Special Region of Yogyakarta': 'DI Yogyakarta',
      'Riau Islands': 'Kepulauan Riau',
      'Bangka Belitung Islands': 'Kepulauan Bangka Belitung',
    };
    return map[region] || region;
  };

  const translateCity = (city: string) => {
    if (!city) return '-';
    const map: Record<string, string> = {
      'South Jakarta': 'Jakarta Selatan',
      'West Jakarta': 'Jakarta Barat',
      'East Jakarta': 'Jakarta Timur',
      'North Jakarta': 'Jakarta Utara',
      'Central Jakarta': 'Jakarta Pusat',
    };
    return map[city] || city;
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const [selectedIpData, setSelectedIpData] = useState<any>(null);
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);
  const [isFetchingIp, setIsFetchingIp] = useState(false);

  const handleIpClick = async (ip: string) => {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      setIsIpModalOpen(true);
      setSelectedIpData({ error: 'IP Localhost tidak dapat dilacak lokasinya.', ip });
      return;
    }
    
    setIsIpModalOpen(true);
    setIsFetchingIp(true);
    setSelectedIpData(null);
    try {
      // 1. Coba gunakan ip-api.com karena memiliki akurasi sampai 'district' (kecamatan)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,district,lat,lon,isp`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setSelectedIpData({
          success: true,
          ip: ip,
          connection: { isp: data.isp },
          country: data.country,
          region: data.regionName,
          city: data.city,
          district: data.district,
          latitude: data.lat,
          longitude: data.lon,
          flag: { emoji: getFlagEmoji(data.countryCode) }
        });
      } else {
        setSelectedIpData({ error: data.message || 'Gagal mengambil data lokasi IP', ip });
      }
    } catch (err) {
      console.error('Failed with primary IP API, trying fallback', err);
      // 2. Fallback ke ipwho.is jika ip-api.com diblokir (misal karena Mixed Content HTTPS)
      try {
        const fbRes = await fetch(`https://ipwho.is/${ip}`);
        const fbData = await fbRes.json();
        if (fbData.success) {
          setSelectedIpData(fbData);
        } else {
          setSelectedIpData({ error: 'Gagal mengambil data IP', ip });
        }
      } catch {
        setSelectedIpData({ error: 'Terjadi kesalahan jaringan atau API diblokir', ip });
      }
    } finally {
      setIsFetchingIp(false);
    }
  };

  const handleCopyIp = async (ip: string) => {
    try {
      await navigator.clipboard.writeText(ip);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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

  // Get only the latest log per IP for the main table
  const latestLogsPerIp = Object.values(
    logs.reduce((acc, log) => {
      // Sort by newest, so if we already have it, we only replace if this one is newer
      if (!acc[log.ip_address]) {
        acc[log.ip_address] = log;
      } else {
        const currentDate = acc[log.ip_address].created_at ? new Date(acc[log.ip_address].created_at).getTime() : 0;
        const newDate = log.created_at ? new Date(log.created_at).getTime() : 0;
        if (newDate > currentDate) {
          acc[log.ip_address] = log;
        }
      }
      return acc;
    }, {} as Record<string, VisitorLog>)
  ).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
  });

  const filteredLogs = latestLogsPerIp.filter(log => {
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

  const renderIpModal = () => {
    if (!isIpModalOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Detail Lokasi IP</h3>
                <p className="text-xs text-gray-500 font-medium">Informasi Geolocation & ISP</p>
              </div>
            </div>
            <button 
              onClick={() => setIsIpModalOpen(false)} 
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto bg-gray-50/50">
            {isFetchingIp ? (
              <div className="flex flex-col justify-center items-center py-12 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">Melacak lokasi IP...</p>
              </div>
            ) : selectedIpData?.error ? (
              <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl">
                <p className="font-medium">{selectedIpData.error}</p>
                <p className="text-sm mt-2 text-red-400">{selectedIpData.ip}</p>
              </div>
            ) : selectedIpData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">IP Address</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedIpData.ip}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">ISP / Provider</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedIpData.connection?.isp || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Negara</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
                        {selectedIpData.country || '-'} {selectedIpData.flag?.emoji}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Provinsi</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{translateRegion(selectedIpData.region)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Kabupaten / Kota</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{translateCity(selectedIpData.city)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Kecamatan</p>
                    <div className="overflow-x-auto pb-1">
                      {selectedIpData.district ? (
                        <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedIpData.district}</p>
                      ) : (
                        <p className="font-semibold text-gray-900 text-sm text-gray-400 italic whitespace-nowrap">
                          -
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Kelurahan</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 text-sm text-gray-400 italic whitespace-nowrap">
                        Tidak terlacak oleh IP
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-1">Koordinat (Lat, Lon)</p>
                    <div className="overflow-x-auto pb-1">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">
                        {selectedIpData.latitude ? `${selectedIpData.latitude}, ${selectedIpData.longitude}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedIpData.latitude && selectedIpData.longitude && (
                  <div className="mt-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2 px-2 pt-2">
                      <p className="text-sm font-semibold text-gray-900">Peta Lokasi (Estimasi)</p>
                    </div>
                    <div className="w-full h-[300px] rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        loading="lazy" 
                        allowFullScreen 
                        referrerPolicy="no-referrer-when-downgrade" 
                        src={`https://maps.google.com/maps?q=${selectedIpData.latitude},${selectedIpData.longitude}&z=13&output=embed`}>
                      </iframe>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span 
                        className="cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                        onClick={() => handleIpClick(log.ip_address)}
                        title="Lihat Detail IP"
                      >
                        {log.ip_address}
                      </span>
                      <button
                        onClick={() => handleCopyIp(log.ip_address)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Copy IP Address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
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
      {renderIpModal()}
    </div>
  );
};
