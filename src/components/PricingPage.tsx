import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { APP_CONFIG, TEXTS } from '../config/config';

interface PricingPageProps {
  onClose: () => void;
  onSelectPackage: (pkgId: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onClose, onSelectPackage }) => {
  const packages = APP_CONFIG.app.packages;
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleUnavailablePackage = (packageName: string) => {
    setToastMessage(`Paket ${packageName} telah habis! Silakan pilih paket lain.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-screen overflow-auto">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#00a884] to-[#008f6f] px-6 pt-8 pb-6 text-center flex-shrink-0">
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
        
        <div className="relative inline-flex mb-3">
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">📦</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Informasi Paket</h2>
        <p className="text-white/90 text-sm relative z-10 max-w-[320px] mx-auto">
          {TEXTS.pricing.subtitle}
        </p>
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-20"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Paket 1: Starter */}
          <div className={`bg-white rounded-xl border-2 p-4 transition-all flex flex-col ${!packages[0].recommended ? 'border-gray-200 hover:border-[#00a884]' : 'border-[#00a884] shadow-lg'}`}>
          {packages[0].recommended && (
            <div className="text-xs text-center mb-2">
              <span className="bg-gradient-to-r from-[#00a884] to-[#00c896] text-white px-3 py-1 rounded-full font-medium">
                {TEXTS.pricing.mostPopular}
              </span>
            </div>
          )}
          <div className="text-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">{packages[0].name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#00a884]">{packages[0].price}</span>
              <span className="text-sm text-gray-400 line-through">{packages[0].originalPrice}</span>
            </div>
            <span className="text-sm text-gray-500">{packages[0].period}</span>
            {packages[0].discount && (
              <div className="mt-1 text-sm font-medium text-red-500">
                {TEXTS.pricing.discount} {packages[0].discount}
              </div>
            )}
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            {TEXTS.pricing.featuresMonthly.privateLock && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresMonthly.privateLock}
              </li>
            )}
            {TEXTS.pricing.featuresMonthly.privacyMode && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresMonthly.privacyMode}
              </li>
            )}
            {TEXTS.pricing.featuresMonthly.noLimit && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresMonthly.noLimit}
              </li>
            )}
            {TEXTS.pricing.featuresMonthly.priority && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresMonthly.priority}
              </li>
            )}
          </ul>
          <button 
            onClick={() => handleUnavailablePackage('Starter')}
            className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-xl transition-all"
          >
            {TEXTS.pricing.selectPackage}
          </button>
        </div>

        {/* Paket 2: Exclusive */}
        <div className={`bg-white rounded-xl border-2 p-4 transition-all flex flex-col ${!packages[1].recommended ? 'border-gray-200 hover:border-[#00a884]' : 'border-[#00a884] shadow-lg'}`}>
          {packages[1].recommended && (
            <div className="text-xs text-center mb-2">
              <span className="bg-gradient-to-r from-[#00a884] to-[#00c896] text-white px-3 py-1 rounded-full font-medium">
                {TEXTS.pricing.mostPopular}
              </span>
            </div>
          )}
          <div className="text-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">{packages[1].name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#00a884]">{packages[1].price}</span>
              <span className="text-sm text-gray-400 line-through">{packages[1].originalPrice}</span>
            </div>
            <span className="text-sm text-gray-500">{packages[1].period}</span>
            {packages[1].discount && (
              <div className="mt-1 text-sm font-medium text-red-500">
                {TEXTS.pricing.discount} {packages[1].discount}
              </div>
            )}
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            {TEXTS.pricing.featuresYearly.privateLock && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.privateLock}
              </li>
            )}
            {TEXTS.pricing.featuresYearly.privacyMode && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.privacyMode}
              </li>
            )}
            {TEXTS.pricing.featuresYearly.noLimit && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.noLimit}
              </li>
            )}
            {TEXTS.pricing.featuresYearly.priority && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.priority}
              </li>
            )}
            {TEXTS.pricing.featuresYearly.exclusive && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.exclusive}
              </li>
            )}
            {TEXTS.pricing.featuresYearly.history && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresYearly.history}
              </li>
            )}
          </ul>
          <button 
            onClick={() => handleUnavailablePackage('Exclusive')}
            className="w-full py-2.5 bg-gradient-to-r from-[#00a884] to-[#00c896] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {TEXTS.pricing.selectPackage}
          </button>
        </div>

        {/* Paket 3: Premium */}
        <div className={`bg-white rounded-xl border-2 p-4 transition-all flex flex-col ${!packages[2].recommended ? 'border-gray-200 hover:border-[#00a884]' : 'border-[#00a884] shadow-lg'}`}>
          {packages[2].recommended && (
            <div className="text-xs text-center mb-2">
              <span className="bg-gradient-to-r from-[#00a884] to-[#00c896] text-white px-3 py-1 rounded-full font-medium">
                {TEXTS.pricing.mostPopular}
              </span>
            </div>
          )}
          <div className="text-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">{packages[2].name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#00a884]">{packages[2].price}</span>
              <span className="text-sm text-gray-400 line-through">{packages[2].originalPrice}</span>
            </div>
            <span className="text-sm text-gray-500">{packages[2].period}</span>
            {packages[2].discount && (
              <div className="mt-1 text-sm font-medium text-red-500">
                {TEXTS.pricing.discount} {packages[2].discount}
              </div>
            )}
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            {TEXTS.pricing.featuresUnlimited.privateLock && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.privateLock}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.privacyMode && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.privacyMode}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.noLimit && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.noLimit}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.priority && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.priority}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.exclusive && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.exclusive}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.unlimited && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.unlimited}
              </li>
            )}
            {TEXTS.pricing.featuresUnlimited.support && (
              <li className="flex items-center gap-2">
                <span className="text-[#00a884]">✓</span> {TEXTS.pricing.featuresUnlimited.support}
              </li>
            )}
          </ul>
          <button 
            onClick={() => {
              onSelectPackage(packages[2].id);
              window.open('https://recover.web.id/topup', '_blank');
            }}
            className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-xl transition-all"
          >
            {TEXTS.pricing.selectPackage}
          </button>
        </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <div className="font-medium">{TEXTS.pricing.trustBadges.securePayment.title}</div>
                <div className="text-gray-400">{TEXTS.pricing.trustBadges.securePayment.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <div className="font-medium">{TEXTS.pricing.trustBadges.instant.title}</div>
                <div className="text-gray-400">{TEXTS.pricing.trustBadges.instant.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <div>
                <div className="font-medium">{TEXTS.pricing.trustBadges.methods.title}</div>
                <div className="text-gray-400">{TEXTS.pricing.trustBadges.methods.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <div>
                <div className="font-medium">{TEXTS.pricing.trustBadges.support.title}</div>
                <div className="text-gray-400">{TEXTS.pricing.trustBadges.support.desc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-[#00a884] via-[#25d366] to-[#00a884] flex-shrink-0"></div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]">
            <div className="bg-red-500/20 p-2 rounded-full">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Paket Tidak Tersedia</p>
              <p className="text-gray-400 text-xs">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;