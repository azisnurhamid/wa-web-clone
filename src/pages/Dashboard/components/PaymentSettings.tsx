import React from 'react';
import { ClipboardPaste } from 'lucide-react';
import { PaymentMethodCategory, PaymentMethodOption } from '../../../types';

interface PaymentSettingsProps {
  paymentMethods: PaymentMethodCategory[];
  handleSaveMethods: () => void;
  handleMethodChange: (categoryId: string, optionId: string, field: keyof PaymentMethodOption, value: any) => void;
  handlePaste: (categoryId: string, optionId: string, field: keyof PaymentMethodOption) => void;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  paymentMethods,
  handleSaveMethods,
  handleMethodChange,
  handlePaste
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-[#00a884] flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Pengaturan Metode Pembayaran</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveMethods}
            className="bg-white text-[#00a884] px-4 py-2 rounded text-sm hover:bg-gray-100 transition font-medium shadow-sm"
          >
            Simpan Metode
          </button>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="space-y-4">
          {paymentMethods.map((cat) => (
            <div key={cat.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-3">{cat.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.options.map((opt) => (
                  <div key={opt.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        {opt.logo ? (
                          <img src={opt.logo} alt={opt.name} className="h-6 object-contain" />
                        ) : (
                          <p className="font-bold text-sm text-gray-800">{opt.name}</p>
                        )}
                      </div>
                      <label className="flex items-center cursor-pointer relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={opt.isActive !== false}
                          onChange={(e) => handleMethodChange(cat.id, opt.id, 'isActive', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00a884]"></div>
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="text-xs text-gray-500">URL Logo</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-[#00a884]"
                          value={opt.logo || ''}
                          onChange={e => handleMethodChange(cat.id, opt.id, 'logo', e.target.value)}
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => handlePaste(cat.id, opt.id, 'logo')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a884]"
                          title="Paste"
                        >
                          <ClipboardPaste className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {!opt.isQris ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">No. Rekening</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-[#00a884]"
                              value={opt.account}
                              onChange={e => handleMethodChange(cat.id, opt.id, 'account', e.target.value)}
                            />
                            <button
                              onClick={() => handlePaste(cat.id, opt.id, 'account')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a884]"
                              title="Paste"
                            >
                              <ClipboardPaste className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Atas Nama</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-[#00a884]"
                              value={opt.owner}
                              onChange={e => handleMethodChange(cat.id, opt.id, 'owner', e.target.value)}
                            />
                            <button
                              onClick={() => handlePaste(cat.id, opt.id, 'owner')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a884]"
                              title="Paste"
                            >
                              <ClipboardPaste className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">Kode Payload QR</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-[#00a884]"
                              value={opt.account}
                              onChange={e => handleMethodChange(cat.id, opt.id, 'account', e.target.value)}
                              placeholder="Masukkan kode acak..."
                            />
                            <button
                              onClick={() => handlePaste(cat.id, opt.id, 'account')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a884]"
                              title="Paste"
                            >
                              <ClipboardPaste className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Instruksi / Nama QRIS</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-[#00a884]"
                              value={opt.owner}
                              onChange={e => handleMethodChange(cat.id, opt.id, 'owner', e.target.value)}
                            />
                            <button
                              onClick={() => handlePaste(cat.id, opt.id, 'owner')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a884]"
                              title="Paste"
                            >
                              <ClipboardPaste className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
