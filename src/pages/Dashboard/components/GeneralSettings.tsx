import React from 'react';

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
      <div className="px-6 py-3 border-b border-gray-200 bg-[#00a884]">
        <h2 className="text-lg font-bold text-white">Pengaturan Umum</h2>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
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
          <div className="flex items-center space-x-4 w-full max-w-md">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Harga (Rp):
            </label>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] focus:border-[#00a884]"
              value={price}
              onChange={handlePriceChange}
              placeholder="Misal: 300.000"
            />
            <button
              onClick={handleSavePrice}
              className="bg-[#00a884] text-white px-4 py-1.5 rounded text-sm hover:bg-[#008f6f] transition font-medium"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
