import React from 'react';
import { Database, Settings, CreditCard, MessageCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type DashboardTab = 'otp' | 'general' | 'payment';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'otp', label: 'Data OTP', icon: Database },
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar untuk Desktop (Landscape) */}
      <aside className="hidden md:flex flex-col w-20 hover:w-64 bg-white shadow-lg z-20 transition-all duration-300 ease-in-out group overflow-hidden">
        <div className="flex items-center h-[72px] bg-[#00a884] px-6">
          <LayoutDashboard size={24} className="text-white flex-shrink-0" />
          <h1 className="text-xl font-bold text-white ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Dashboard
          </h1>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors font-medium overflow-hidden ${
                  isActive 
                    ? 'bg-[#00a884]/10 text-[#00a884]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={item.label}
              >
                <Icon size={24} className={`flex-shrink-0 ${isActive ? 'text-[#00a884]' : 'text-gray-400'}`} />
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex items-center w-full px-2 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium overflow-hidden"
            title="Ke Aplikasi Chat"
          >
            <MessageCircle size={24} className="flex-shrink-0 text-gray-400" />
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Ke Aplikasi Chat
            </span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Mobile */}
        <header className="md:hidden bg-[#00a884] p-4 shadow-sm z-20 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">Dashboard</h1>
          <button
            onClick={() => navigate('/')}
            className="text-white bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Chat
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navbar untuk Mobile (Portrait) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 z-30 pb-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full ${
                  isActive ? 'text-[#00a884]' : 'text-gray-500'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#00a884]' : 'text-gray-400'} />
                <span className={`text-[11px] font-medium ${isActive ? 'text-[#00a884]' : 'text-gray-500'}`}>
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
