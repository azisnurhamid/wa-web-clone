import React from 'react';
import { X, Check, Lock, Shield, Zap, Star, Crown, Infinity, CreditCard, Headphones, Clock } from 'lucide-react';
import { APP_CONFIG, COLORS } from '../config';

interface PricingPageProps {
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onClose, onSelectPackage }) => {
  const packages = APP_CONFIG.app.packages || [];

  const features = {
    monthly: [
      { icon: Lock, text: "Kunci Chat Pribadi" },
      { icon: Shield, text: "Mode Privasi Aktif" },
      { icon: Zap, text: "Tanpa Batasan Fitur" },
      { icon: Star, text: "Dukungan Prioritas" },
    ],
    yearly: [
      { icon: Lock, text: "Kunci Chat Pribadi" },
      { icon: Shield, text: "Mode Privasi Aktif" },
      { icon: Zap, text: "Tanpa Batasan Fitur" },
      { icon: Star, text: "Dukungan Prioritas" },
      { icon: Crown, text: "Akses Eksklusif" },
      { icon: Clock, text: "Simpan Riwayat Lengkap" },
    ],
    unlimited: [
      { icon: Lock, text: "Kunci Chat Pribadi" },
      { icon: Shield, text: "Mode Privasi Aktif" },
      { icon: Zap, text: "Tanpa Batasan Fitur" },
      { icon: Star, text: "Dukungan Prioritas" },
      { icon: Crown, text: "Akses Eksklusif" },
      { icon: Infinity, text: "Semua Fitur Unlimited" },
      { icon: Headphones, text: "Support 24/7" },
    ],
  };

  const getFeatures = (pkgId: string) => {
    switch (pkgId) {
      case 'monthly': return features.monthly;
      case 'yearly': return features.yearly;
      case 'unlimited': return features.unlimited;
      default: return features.monthly;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-gray-900 to-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#00a884] via-[#00c896] to-[#00a884] py-12 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-6">
            <Crown size={40} className="text-[#00a884]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Paket Premium</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan Anda dan nikmati pengalaman WhatsApp tanpa batasan
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg: any, idx: number) => {
            const pkgFeatures = getFeatures(pkg.id);
            const isRecommended = pkg.recommended;

            return (
              <div 
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  isRecommended ? 'ring-4 ring-[#00a884] ring-offset-2 transform scale-105' : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#00a884] to-[#00c896] text-white text-center py-2 font-semibold text-sm">
                    🔥 Paling Populer
                  </div>
                )}

                <div className={`p-6 ${isRecommended ? 'pt-12' : 'pt-6'}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pkg.period}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#00a884]">{pkg.price}</span>
                    {pkg.originalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                          Hemat {pkg.discount}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      window.location.href = APP_CONFIG.app.paywallUrl + '/topup?package=' + pkg.id;
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isRecommended
                        ? 'bg-gradient-to-r from-[#00a884] to-[#00c896] text-white hover:shadow-lg hover:shadow-[#00a884]/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pilih Paket
                  </button>
                </div>

                <div className="border-t border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Fitur Included:</h4>
                  <ul className="space-y-3">
                    {pkgFeatures.map((feature: any, featureIdx: number) => (
                      <li key={featureIdx} className="flex items-center gap-3 text-gray-600">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-green-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <feature.icon size={16} className="text-[#00a884]" />
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {isRecommended && (
                  <div className="bg-gradient-to-r from-[#00a884]/10 to-[#00c896]/10 p-4 text-center">
                    <p className="text-[#00a884] text-sm font-medium">✓ Best Value for Money</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-8">Mengapa Memilih Kami?</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Pembayaran Aman", desc: "Transaksi terenkripsi" },
              { icon: Zap, title: "Aktivasi Instan", desc: "Langsung aktif setelah bayar" },
              { icon: CreditCard, title: "Berbagai Metode", desc: "QRIS, Transfer, E-Wallet" },
              { icon: Headphones, title: "Support 24/7", desc: "Siap membantu kapan saja" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-[#00a884]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <item.icon size={24} className="text-[#00a884]" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Ada pertanyaan? Hubungi kami di{' '}
            <a href="mailto:support@recover.web.id" className="text-[#00a884] hover:underline">
              support@recover.web.id
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 WhatsApp Clone. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
