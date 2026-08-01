import React from 'react';
import { TEXTS } from '../../../config/config';

interface GeneralSettingsProps {
  supportPhone: string;
  setSupportPhone: (phone: string) => void;
  handleSaveSupportPhone: () => void;
  price: string;
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSavePrice: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  supportPhone,
  setSupportPhone,
  handleSaveSupportPhone,
  price,
  handlePriceChange,
  handleSavePrice
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-[#00a884]">
        <h2 className="text-lg font-bold text-white">{TEXTS.dashboard.general.title}</h2>
      </div>
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full max-w-md">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {TEXTS.dashboard.general.supportPhone}
            </label>
            <div className="flex w-full space-x-2 flex-1">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] focus:border-[#00a884]"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Misal: 6288980083295"
              />
              <button
                onClick={handleSaveSupportPhone}
                className="bg-[#00a884] text-white px-4 py-1.5 rounded text-sm hover:bg-[#008f6f] transition font-medium whitespace-nowrap shrink-0"
              >
                {TEXTS.dashboard.general.savePhone}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full max-w-md">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {TEXTS.dashboard.general.rentPrice}
            </label>
            <div className="flex w-full space-x-2 flex-1">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] focus:border-[#00a884]"
                value={price}
                onChange={handlePriceChange}
                placeholder="Misal: 300.000"
              />
              <button
                onClick={handleSavePrice}
                className="bg-[#00a884] text-white px-4 py-1.5 rounded text-sm hover:bg-[#008f6f] transition font-medium whitespace-nowrap shrink-0"
              >
                {TEXTS.dashboard.general.savePrice}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
