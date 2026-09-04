import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Eye,
  Lock,
  MapPin,
  MessageSquare,
  PhoneCall,
  Image as ImageIcon,
  ChevronDown,
  ArrowRight,
  Zap,
  Users,
  HelpCircle,
  Sparkles,
  Activity,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/utils/constants';
import { APP_CONFIG, TEXTS, URLS, getTexts, getDeviceLanguage } from '@/config/config';

interface LandingPageProps {
  onStart: (initialPhone?: string) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem('landing_theme');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }
  return 'dark';
};

const getInitialLang = (): 'id' | 'en' => {
  return getDeviceLanguage();
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [currentLang, setCurrentLang] = useState<'id' | 'en'>(getInitialLang);
  const L = getTexts(currentLang).landing;
  const [targetPhoneInput, setTargetPhoneInput] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const isDark = theme === 'dark';

  const handleLanguageChange = (lang: 'id' | 'en') => {
    if (lang === currentLang) return;
    localStorage.setItem('wa_lang', lang);
    setCurrentLang(lang);
    window.location.reload();
  };

  useEffect(() => {
    localStorage.setItem('landing_theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('landing_theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const formatTargetPhone = (val: string): string => {
    let digits = val.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('628')) {
      digits = '08' + digits.substring(3);
    } else if (digits.startsWith('62')) {
      digits = '0' + digits.substring(2);
    }

    if (digits.startsWith('8')) {
      digits = '0' + digits;
    }

    if (digits.length >= 1 && !digits.startsWith('0')) {
      digits = '0' + digits;
    }
    if (digits.length >= 2 && !digits.startsWith('08')) {
      digits = '08' + digits.substring(2);
    }

    if (digits.length > 13) {
      digits = digits.slice(0, 13);
    }

    const chunks = [];
    for (let i = 0; i < digits.length; i += 4) {
      chunks.push(digits.slice(i, i + 4));
    }
    return chunks.join('-');
  };

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = targetPhoneInput.replace(/\D/g, '');
    if (!digitsOnly.startsWith('08')) {
      alert(L.hero.alertInvalidStart);
      return;
    }
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      alert(L.hero.alertInvalidLength);
      return;
    }
    localStorage.setItem('auth_phone_number', digitsOnly);
    onStart(digitsOnly);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const supportPhone = localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone;

  const featureIcons = [MessageSquare, MapPin, PhoneCall, ImageIcon, Lock, Smartphone];
  const featureColors = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ];

  const features = L.featuresSection.items.map((item: any, i: number) => ({
    icon: featureIcons[i],
    title: item.title,
    desc: item.desc,
    color: featureColors[i],
  }));

  const steps = L.stepsSection.items;
  const testimonials = L.testimonialsSection.items;
  const faqs = L.faqSection.items;

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#00a884] selection:text-white relative overflow-x-hidden transition-colors duration-300 landscape:pl-16 md:pl-16 pb-20 md:pb-0 landscape:pb-0 ${
        isDark ? 'bg-[#0b141a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`}
    >
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] blur-[140px] pointer-events-none rounded-full ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'
        }`}
      />
      <div
        className={`absolute top-[40%] right-0 w-[500px] h-[500px] blur-[160px] pointer-events-none rounded-full ${
          isDark ? 'bg-teal-500/10' : 'bg-teal-400/20'
        }`}
      />

      <aside
        className={`hidden landscape:flex md:flex flex-col fixed left-0 top-0 h-screen z-50 w-16 hover:w-64 transition-all duration-300 ease-in-out group overflow-hidden ${
          isDark
            ? 'bg-[#0b141a]/95 backdrop-blur-xl border-r border-emerald-900/40 shadow-2xl'
            : 'bg-white/95 backdrop-blur-xl border-r border-emerald-100 shadow-xl'
        }`}
      >
        <div
          className={`p-3.5 flex items-center gap-3 border-b min-w-max ${
            isDark ? 'border-emerald-900/30' : 'border-emerald-100'
          }`}
        >
          <div className="w-9 h-9 min-w-[36px] bg-gradient-to-tr from-[#00a884] to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Eye className="w-5 h-5 text-slate-950" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold text-base tracking-tight ${
                  isDark
                    ? 'bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-slate-900 via-slate-700 to-[#00a884] bg-clip-text text-transparent'
                }`}
              >
                {L.brand.name}<span className="text-[#00a884]">{L.brand.tag}</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                {L.brand.status}
              </span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {L.brand.subtitle}
            </p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto min-w-max">
          <button
            onClick={() => scrollToSection('fitur')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40'
                : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-5 h-5 min-w-[20px] text-emerald-400 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {L.nav.features}
            </span>
          </button>

          <button
            onClick={() => scrollToSection('cara-kerja')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40'
                : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Zap className="w-5 h-5 min-w-[20px] text-teal-400 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {L.nav.steps}
            </span>
          </button>

          <button
            onClick={() => scrollToSection('testimoni')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40'
                : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-5 h-5 min-w-[20px] text-blue-400 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {L.nav.testimonials}
            </span>
          </button>

          <button
            onClick={() => scrollToSection('faq')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40'
                : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <HelpCircle className="w-5 h-5 min-w-[20px] text-amber-400 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {L.nav.faq}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                : 'text-slate-700 hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={isDark ? L.nav.lightMode : L.nav.darkMode}
          >
            {isDark ? (
              <Sun className="w-5 h-5 min-w-[20px] text-amber-400 group-hover/btn:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 min-w-[20px] text-slate-700 group-hover/btn:-rotate-12 transition-transform" />
            )}
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {isDark ? L.nav.lightMode : L.nav.darkMode}
            </span>
          </button>

          <button
            onClick={() => handleLanguageChange(currentLang === 'id' ? 'en' : 'id')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition group/btn cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-cyan-400 hover:bg-emerald-950/40'
                : 'text-slate-700 hover:text-cyan-600 hover:bg-emerald-50'
            }`}
            title={currentLang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            <div className="flex items-center gap-3.5 min-w-max">
              <Globe className="w-5 h-5 min-w-[20px] text-cyan-400 group-hover/btn:rotate-45 transition-transform" />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {currentLang === 'id' ? 'Bahasa Indonesia' : 'English'}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center min-w-max">
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500 text-white shadow-sm uppercase tracking-wider">
                {currentLang === 'id' ? 'ID' : 'EN'}
              </span>
            </div>
          </button>
        </nav>

        <div
          className={`p-2 border-t min-w-max ${
            isDark ? 'border-emerald-900/30' : 'border-emerald-100'
          }`}
        >
          <button
            onClick={() => onStart()}
            className="w-full bg-gradient-to-r from-[#00a884] to-emerald-500 text-white font-semibold p-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 min-w-[20px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {L.nav.startBtn}
            </span>
          </button>
        </div>
      </aside>

      <header
        className={`landscape:hidden md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur-md transition-all duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          isDark
            ? 'bg-[#0b141a]/90 border-b border-emerald-900/30'
            : 'bg-white/90 border-b border-emerald-100 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#00a884] to-emerald-400 rounded-lg flex items-center justify-center shadow-md">
            <Eye className="w-4 h-4 text-slate-950" />
          </div>
          <span
            className={`font-bold text-base ${
              isDark
                ? 'bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-900 via-slate-700 to-[#00a884] bg-clip-text text-transparent'
            }`}
          >
            {L.brand.name}<span className="text-[#00a884]">{L.brand.tag}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLanguageChange(currentLang === 'id' ? 'en' : 'id')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-cyan-700 hover:bg-slate-200'
            }`}
            title={currentLang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="uppercase tracking-wider font-extrabold">{currentLang === 'id' ? 'ID' : 'EN'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? L.nav.lightMode : L.nav.darkMode}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
          <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {L.brand.status}
          </span>
        </div>
      </header>

      <div
        className={`landscape:hidden md:hidden fixed bottom-3 left-3 right-3 z-50 transition-all duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <nav
          className={`backdrop-blur-xl border rounded-2xl shadow-2xl p-2 flex items-center justify-between ${
            isDark
              ? 'bg-[#111b21]/95 border-emerald-500/30 shadow-slate-950/80'
              : 'bg-white/95 border-emerald-500/30 shadow-emerald-900/10'
          }`}
        >
          <button
            onClick={() => scrollToSection('fitur')}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-medium">{L.nav.featuresShort}</span>
          </button>

          <button
            onClick={() => scrollToSection('cara-kerja')}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <Zap className="w-4 h-4 text-teal-400" />
            <span className="text-[10px] font-medium">{L.nav.stepsShort}</span>
          </button>

          <button
            onClick={() => scrollToSection('testimoni')}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-medium">{L.nav.testiShort}</span>
          </button>

          <button
            onClick={() => scrollToSection('faq')}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-medium">{L.nav.faqShort}</span>
          </button>
        </nav>
      </div>

      <section className="relative pt-16 pb-20 sm:pt-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500 ${
              isDark
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{L.hero.badge}</span>
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {L.hero.titlePart1} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {L.hero.titlePart2}
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {L.hero.subtitle}
          </p>

          <div
            className={`mt-8 max-w-md mx-auto backdrop-blur-xl p-4 sm:p-6 rounded-2xl border shadow-2xl ${
              isDark
                ? 'bg-slate-900/80 border-slate-800/80 shadow-emerald-950/40'
                : 'bg-white border-slate-200 shadow-emerald-900/10'
            }`}
          >
            <form onSubmit={handleStartSubmit} className="space-y-4">
              <div className="text-left">
                <label
                  className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {L.hero.inputLabel}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 font-medium text-sm flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="tel"
                    value={targetPhoneInput}
                    onChange={(e) => setTargetPhoneInput(formatTargetPhone(e.target.value))}
                    placeholder={L.hero.inputPlaceholder}
                    className={`w-full border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium transition ${
                      isDark
                        ? 'bg-slate-950 border-slate-700/80 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <p
                  className={`text-[11px] mt-2 flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{L.hero.encryptionNote}</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00a884] via-emerald-500 to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>{L.hero.submitBtn}</span>
              </button>
            </form>
          </div>

          <div
            className={`pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto border-t mt-10 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}
          >
            <div className="p-3">
              <div
                className={`text-2xl font-bold flex items-center gap-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>{L.metrics.hacked.value}</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {L.metrics.hacked.label}
              </p>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                <span>{L.metrics.successRate.value}</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {L.metrics.successRate.label}
              </p>
            </div>
            <div className="p-3">
              <div
                className={`text-2xl font-bold flex items-center gap-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>{L.metrics.stealthMode.value}</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {L.metrics.stealthMode.label}
              </p>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                <span>{L.metrics.serverUptime.value}</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {L.metrics.serverUptime.label}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-5xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-25"></div>
          <div
            className={`relative rounded-2xl border overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-[#202c33] border-slate-700/60' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span
                  className={`text-xs font-mono ml-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {URLS.dashboard?.mockDomain || L.preview.urlDomain}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>{L.preview.syncActive}</span>
              </div>
            </div>

            <div
              className={`p-6 grid md:grid-cols-3 gap-6 ${
                isDark ? 'bg-[#0b141a]' : 'bg-slate-50'
              }`}
            >
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {L.preview.chatIntercept.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{L.preview.chatIntercept.time}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isDark ? 'bg-[#202c33] text-slate-200' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="font-semibold text-emerald-500 text-[11px]">
                      {L.preview.chatIntercept.sender}
                    </p>
                    <p className="mt-0.5">{L.preview.chatIntercept.message}</p>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-emerald-950/40 border-emerald-800/40 text-slate-300'
                        : 'bg-emerald-50 border-emerald-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded font-mono">
                      {L.preview.chatIntercept.deletedBadge}
                    </span>
                    <p className="mt-1 line-through text-slate-400">
                      {L.preview.chatIntercept.deletedMessage}
                    </p>
                    <p className="text-[10px] text-emerald-500 mt-1 font-semibold">
                      {L.preview.chatIntercept.restoredText}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {L.preview.gpsTrack.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">{L.preview.gpsTrack.accuracy}</span>
                </div>
                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-semibold">{L.preview.gpsTrack.location}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {L.preview.gpsTrack.coords}
                  </p>
                  <div
                    className={`h-16 rounded border flex items-center justify-center text-xs ${
                      isDark
                        ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {L.preview.gpsTrack.mapText}
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {L.preview.callMedia.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">3 Files</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      isDark ? 'bg-[#202c33]' : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {L.preview.callMedia.callType}
                        </p>
                        <p className="text-[10px] text-slate-400">{L.preview.callMedia.callDuration}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      PLAY AUDIO
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      isDark ? 'bg-[#202c33]' : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {L.preview.callMedia.mediaTitle}
                        </p>
                        <p className="text-[10px] text-slate-400">{L.preview.callMedia.mediaCount}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">
                      DOWNLOAD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className={`py-20 border-y relative ${
          isDark ? 'bg-[#0f1c24] border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
              {L.featuresSection.badge}
            </h2>
            <p
              className={`text-3xl sm:text-4xl font-extrabold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {L.featuresSection.title}
            </p>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {L.featuresSection.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item: any, idx: number) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all group hover:scale-[1.02] ${
                    isDark
                      ? 'bg-[#111b21] border-slate-800 hover:border-emerald-500/40'
                      : 'bg-white border-slate-200 hover:border-emerald-400 shadow-md'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:rotate-6 transition-transform`}
                  >
                    <IconComp className="w-6 h-6 text-white" />
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
            {L.stepsSection.badge}
          </h2>
          <p
            className={`text-3xl sm:text-4xl font-extrabold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {L.stepsSection.title}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border relative space-y-4 ${
                isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              <span
                className={`text-4xl font-black font-mono ${
                  isDark ? 'text-emerald-500/30' : 'text-emerald-600/20'
                }`}
              >
                {item.step}
              </span>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onStart()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00a884] to-emerald-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-base cursor-pointer"
          >
            <span>{L.ctaSection.btn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section
        id="testimoni"
        className={`py-20 border-t ${
          isDark ? 'bg-[#0f1c24] border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
              {L.testimonialsSection.badge}
            </h2>
            <p
              className={`text-3xl sm:text-4xl font-extrabold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {L.testimonialsSection.title}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#111b21] border-slate-800' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, r) => (
                      <span key={r}>★</span>
                    ))}
                  </div>
                  <p
                    className={`text-sm italic ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    "{t.comment}"
                  </p>
                </div>
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs text-emerald-500 font-medium">{t.role}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
            {L.faqSection.badge}
          </h2>
          <p
            className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
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

      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div
          className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 relative overflow-hidden shadow-2xl ${
            isDark
              ? 'bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400 shadow-emerald-900/20'
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {L.ctaSection.title}
          </h2>
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
            <p className="text-slate-400 leading-relaxed">
              {L.footer.desc}
            </p>
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
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {L.footer.desc}
            </p>
            <p className="text-slate-500 pt-2 font-mono text-[10px]">
              {L.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
