
import React from 'react';
import { X, Check, Lock, Shield, Zap, Star, Crown, Infinity, CreditCard, Headphones, Clock, Timer } from 'lucide-react';
import { APP_CONFIG, TEXTS } from '../config/config';

interface PricingPageProps {
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onClose, onSelectPackage }) => {
  const packages = APP_CONFIG.app.packages || [];
  
  const getPackageEndTime = (pkgEndTime: string | null | undefined) => {
    if (!pkgEndTime) return null;
    const now = new Date();
    const [hours, minutes] = pkgEndTime.split(':').map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  };
  
  const getDefaultPromoEndTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };
  
  const defaultPromoEndTime = TEXTS.pricing.promoEndTime ? new Date(TEXTS.pricing.promoEndTime) : getDefaultPromoEndTime();
  const now = new Date();
  
  const getPackagePromoStatus = (pkg: any) => {
    const pkgEndTime = getPackageEndTime(pkg.promoEndTime);
    const endTime = pkgEndTime || defaultPromoEndTime;
    return { endTime, isActive: endTime > now };
  };
  
  const formatRemainingTime = (endDate: Date) => {
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} ${TEXTS.pricing.timeUnits.days} ${hours} ${TEXTS.pricing.timeUnits.hours}`;
    if (hours > 0) return `${hours} ${TEXTS.pricing.timeUnits.hours} ${minutes} ${TEXTS.pricing.timeUnits.minutes}`;
    return `${minutes} ${TEXTS.pricing.timeUnits.minutes}`;
  };
  
  const getPromoSubtitle = () => {
    if (TEXTS.pricing.promoSubtitle) return TEXTS.pricing.promoSubtitle;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Berlaku hingga ${tomorrow.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][tomorrow.getMonth()]} ${tomorrow.getFullYear()} jam 00:00`;
  };

  const features = {
    monthly: [
      { icon: Lock, text: TEXTS.pricing.featuresMonthly.privateLock },
      { icon: Shield, text: TEXTS.pricing.featuresMonthly.privacyMode },
      { icon: Zap, text: TEXTS.pricing.featuresMonthly.noLimit },
      { icon: Star, text: TEXTS.pricing.featuresMonthly.priority },
    ],
    yearly: [
      { icon: Lock, text: TEXTS.pricing.featuresYearly.privateLock },
      { icon: Shield, text: TEXTS.pricing.featuresYearly.privacyMode },
      { icon: Zap, text: TEXTS.pricing.featuresYearly.noLimit },
      { icon: Star, text: TEXTS.pricing.featuresYearly.priority },
      { icon: Crown, text: TEXTS.pricing.featuresYearly.exclusive },
      { icon: Clock, text: TEXTS.pricing.featuresYearly.history },
    ],
    unlimited: [
      { icon: Lock, text: TEXTS.pricing.featuresUnlimited.privateLock },
      { icon: Shield, text: TEXTS.pricing.featuresUnlimited.privacyMode },
      { icon: Zap, text: TEXTS.pricing.featuresUnlimited.noLimit },
      { icon: Star, text: TEXTS.pricing.featuresUnlimited.priority },
      { icon: Crown, text: TEXTS.pricing.featuresUnlimited.exclusive },
      { icon: Infinity, text: TEXTS.pricing.featuresUnlimited.unlimited },
      { icon: Headphones, text: TEXTS.pricing.featuresUnlimited.support },
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
          <h1 className="text-4xl font-bold text-white mb-4">{TEXTS.pricing.title}</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            {TEXTS.pricing.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg: any, idx: number) => {
            const pkgFeatures = getFeatures(pkg.id);
            const isRecommended = pkg.recommended;
            const { endTime: promoEndTime, isActive: isPromoActive } = getPackagePromoStatus(pkg);

            return (
              <div 
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  isRecommended ? 'ring-4 ring-[#00a884] ring-offset-2 transform scale-105' : ''
                }`}
              >
                {isPromoActive && (
                  <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 font-semibold text-xs flex items-center justify-center gap-1">
                    <Timer size={12} />
                    <span>{TEXTS.pricing.promoTitle} • {formatRemainingTime(promoEndTime)}</span>
                  </div>
                )}
                {!isPromoActive && pkg.promoEndTime && (
                  <div className="absolute top-0 left-0 right-0 bg-gray-400 text-white text-center py-1 font-semibold text-xs flex items-center justify-center gap-1">
                    <span>{TEXTS.pricing.promoEnded}</span>
                  </div>
                )}
                {isRecommended && (
                  <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-[#00a884] to-[#00c896] text-white text-center py-2 font-semibold text-sm ${(isPromoActive || pkg.promoEndTime) ? 'top-6' : ''}`}>
                    {TEXTS.pricing.mostPopular}
                  </div>
                )}

                <div className={`p-6 ${isRecommended ? 'pt-14' : (isPromoActive || pkg.promoEndTime) ? 'pt-10' : 'pt-6'}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pkg.period}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#00a884]">{pkg.price}</span>
                    {pkg.originalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                          {TEXTS.pricing.discount} {pkg.discount}
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
                    {TEXTS.pricing.selectPackage}
                  </button>
                </div>

                <div className="border-t border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">{TEXTS.pricing.features}</h4>
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
                    <p className="text-[#00a884] text-sm font-medium">{TEXTS.pricing.bestValue}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-8">{TEXTS.pricing.whyChoose}</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: TEXTS.pricing.trustBadges.securePayment.title, desc: TEXTS.pricing.trustBadges.securePayment.desc },
              { icon: Zap, title: TEXTS.pricing.trustBadges.instant.title, desc: TEXTS.pricing.trustBadges.instant.desc },
              { icon: CreditCard, title: TEXTS.pricing.trustBadges.methods.title, desc: TEXTS.pricing.trustBadges.methods.desc },
              { icon: Headphones, title: TEXTS.pricing.trustBadges.support.title, desc: TEXTS.pricing.trustBadges.support.desc },
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

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            {TEXTS.pricing.support}{' '}
            <a href={`mailto:${TEXTS.pricing.supportEmail}`} className="text-[#00a884] hover:underline">
              {TEXTS.pricing.supportEmail}
            </a>
          </p>
        </div>
      </div>

      <div className="bg-gray-900 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          <p>{TEXTS.pricing.footer}</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
