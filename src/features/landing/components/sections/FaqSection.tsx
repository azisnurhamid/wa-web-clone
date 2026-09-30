import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  L: any;
  faqs: any[];
  isDark: boolean;
  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ L, faqs, isDark, activeFaq, setActiveFaq }) => {
  return (
    <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
          {L.faqSection.badge}
        </h2>
        <p className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {L.faqSection.title}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq: any, idx: number) => {
          const isOpen = activeFaq === idx;
          return (
            <div
              key={idx}
              className={`border rounded-xl overflow-hidden transition ${
                isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className={`w-full p-5 text-left font-semibold flex items-center justify-between gap-4 hover:text-emerald-400 transition cursor-pointer ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                  }`}
                />
              </button>
              {isOpen && (
                <div
                  className={`px-5 pb-5 text-sm leading-relaxed border-t pt-3 ${
                    isDark
                      ? 'text-slate-300 border-slate-800/60'
                      : 'text-slate-600 border-slate-100'
                  }`}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
