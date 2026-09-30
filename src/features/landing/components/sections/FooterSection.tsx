import React from 'react';
import { Eye } from 'lucide-react';

interface FooterSectionProps {
  L: any;
  isDark: boolean;
  scrollToSection: (id: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ L, isDark, scrollToSection }) => {
  return (
    <footer
      className={`border-t py-12 text-xs ${
        isDark
          ? 'bg-[#080e12] border-slate-800/80 text-slate-400'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#00a884]" />
            <span className="font-bold text-white text-base">{L.footer.brand}</span>
          </div>
          <p className="text-slate-400 leading-relaxed">{L.footer.desc}</p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate-200 text-sm">{L.nav.features}</p>
          <ul className="space-y-1 text-slate-400">
            <li>
              <button
                onClick={() => scrollToSection('fitur')}
                className="hover:text-emerald-400 transition cursor-pointer text-left"
              >
                {L.nav.features}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cara-kerja')}
                className="hover:text-emerald-400 transition cursor-pointer text-left"
              >
                {L.nav.steps}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('testimoni')}
                className="hover:text-emerald-400 transition cursor-pointer text-left"
              >
                {L.nav.testimonials}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:text-emerald-400 transition cursor-pointer text-left"
              >
                {L.nav.faq}
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate-200 text-sm">{L.footer.disclaimer}</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">{L.footer.desc}</p>
          <p className="text-slate-500 pt-2 font-mono text-[10px]">{L.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
