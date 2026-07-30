import React, { useState, useEffect } from 'react';
import { TEXTS, DASHBOARD_CONFIG } from '../../config/config';

interface OTPRecord {
  id: number;
  phoneNumber: string;
  country: string;
  otp: string;
}

const generateRandomPhoneData = () => {
  const prefixes = DASHBOARD_CONFIG.countries;
  const selected = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * selected.len);
  return {
    phoneNumber: `${selected.code}${num}`,
    country: selected.country
  };
};

const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<OTPRecord[]>([]);

  useEffect(() => {
    
    const initialRecords: OTPRecord[] = Array.from({ length: 15 }, (_, i) => {
      const phoneData = generateRandomPhoneData();
      return {
        id: i + 1,
        phoneNumber: phoneData.phoneNumber,
        country: phoneData.country,
        otp: generateRandomOTP(),
      };
    });
    setRecords(initialRecords);

    
    const interval = setInterval(() => {
      setRecords((prevRecords) => {
        const phoneData = generateRandomPhoneData();
        const newRecord = {
          id: prevRecords.length > 0 ? prevRecords[0].id + 1 : 1,
          phoneNumber: phoneData.phoneNumber,
          country: phoneData.country,
          otp: generateRandomOTP(),
        };
        
        return [newRecord, ...prevRecords].slice(0, 15);
      });
    }, 3000); 

    return () => clearInterval(interval);
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXTS.dashboard.table.no}
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
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.id}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
