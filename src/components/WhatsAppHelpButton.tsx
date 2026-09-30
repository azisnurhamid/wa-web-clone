import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { TEXTS, APP_CONFIG } from '@/config/config';
import { STORAGE_KEYS } from '@/utils/constants';

const WhatsAppHelpButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const supportPhone = localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone;
  const message = encodeURIComponent(TEXTS.whatsappButton.defaultMessage);

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-[9999] group">
      <div
        className={`bg-white px-3 py-1.5 rounded-lg shadow-md text-sm text-gray-700 whitespace-nowrap transition-opacity ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
      >
        {TEXTS.whatsappButton.tooltip}
      </div>
      <a
        href={`https://wa.me/${supportPhone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <MessageCircle size={32} className="text-white" />
        </div>
        <div className="absolute w-full h-full flex items-center justify-center">
          <Phone size={14} className="text-white" />
        </div>
      </a>
    </div>
  );
};

export default WhatsAppHelpButton;
