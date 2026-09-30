import React from 'react';
import { TEXTS } from '@/config/config';

interface CtaSectionProps {
  L: any;
  isDark: boolean;
  onStart: () => void;
  supportPhone: string;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ L, isDark, onStart, supportPhone }) => {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      <div
        className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 relative overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border-emerald-500/30'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400 shadow-emerald-900/20'
        }`}
      >
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{L.ctaSection.title}</h2>
        <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto">
          {L.ctaSection.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onStart()}
            className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-slate-100 font-extrabold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all text-base cursor-pointer"
          >
            {L.ctaSection.btn}
          </button>
          <a
            href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(
              TEXTS.whatsappButton.defaultMessage,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all text-base flex items-center justify-center gap-2"
          >
            <span>{TEXTS.whatsappButton.tooltip}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
