import React, { useState } from 'react';
import {
  Database,
  Settings,
  CreditCard,
  MessageCircle,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { TEXTS } from '../../../config/config';

export type DashboardTab = 'otp' | 'general' | 'payment';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  children,
}) => {
  const history = useHistory();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 20) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
    setLastScrollY(currentScrollY);

    const sections: DashboardTab[] = ['otp', 'general', 'payment'];
    let current: DashboardTab = 'otp';

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();

        if (rect.top <= window.innerHeight / 2) {
          current = section;
        }
      }
    }

    if (current !== activeTab) {
      onTabChange(current);
    }
  };

  const handleNavClick = (id: DashboardTab) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onTabChange(id);
  };

  const navItems = [
    { id: 'otp', label: TEXTS.dashboard.layout.tabOtp, icon: Database },
    { id: 'general', label: TEXTS.dashboard.layout.tabGeneral, icon: Settings },
    { id: 'payment', label: TEXTS.dashboard.layout.tabPayment, icon: CreditCard },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {}
      <aside className="hidden md:flex flex-col w-20 hover:w-64 bg-white shadow-lg z-20 transition-all duration-300 ease-in-out group overflow-hidden">
        <div className="flex items-center h-[72px] bg-[#00a884] px-7">
          <LayoutDashboard size={24} className="text-white flex-shrink-0" />
          <h1 className="text-xl font-bold text-white ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {TEXTS.dashboard.layout.dashboard}
          </h1>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as DashboardTab)}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors font-medium overflow-hidden ${
                  isActive
                    ? 'bg-[#00a884]/10 text-[#00a884]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={item.label}
              >
                <Icon
                  size={24}
                  className={`flex-shrink-0 ${isActive ? 'text-[#00a884]' : 'text-gray-400'}`}
                />
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => history.push('/')}
            className="flex items-center w-full px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium overflow-hidden"
            title={TEXTS.dashboard.layout.toChatApp}
          >
            <MessageCircle size={24} className="flex-shrink-0 text-gray-400" />
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {TEXTS.dashboard.layout.toChatApp}
            </span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-3 py-3 mt-1 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium overflow-hidden"
            title={TEXTS.dashboard.layout.logout}
          >
            <LogOut size={24} className="flex-shrink-0" />
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {TEXTS.dashboard.layout.logout}
            </span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {}
        <header className="md:hidden bg-[#00a884] p-4 shadow-sm z-20 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">{TEXTS.dashboard.layout.dashboard}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => history.push('/')}
              className="text-white bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <MessageCircle size={16} />
              Chat
            </button>
            <button
              onClick={onLogout}
              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              {TEXTS.dashboard.layout.logout}
            </button>
          </div>
        </header>

        {}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar"
          onScroll={handleScroll}
        >
          <div className="max-w-4xl mx-auto w-full">{children}</div>
        </div>
      </main>

      {}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 z-30 pb-2 transition-transform duration-300 ease-in-out ${
          showNav ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as DashboardTab)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full ${
                  isActive ? 'text-[#00a884]' : 'text-gray-500'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#00a884]' : 'text-gray-400'} />
                <span
                  className={`text-[11px] font-medium ${isActive ? 'text-[#00a884]' : 'text-gray-500'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
