import React, { useState, useEffect } from 'react';
import { useConfig } from '../../config/config';
import { useData } from '../../context/DataProvider';
import { OTPRecord, PaymentMethodCategory, PaymentMethodOption } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';
import { fetchOtpRecords, fetchSettings, saveSetting } from '../../services/api';
import { OtpTable } from './components/OtpTable';
import { GeneralSettings } from './components/GeneralSettings';
import { PaymentSettings } from './components/PaymentSettings';
import { DashboardLayout, DashboardTab } from './components/DashboardLayout';
import DashboardLogin from './DashboardLogin';

const Dashboard: React.FC = () => {
  const { TEXTS, APP_CONFIG, DASHBOARD_CONFIG } = useConfig();
  const { data } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuth = sessionStorage.getItem('dashboard_auth') === 'true';
    const authDate = sessionStorage.getItem('dashboard_auth_date');
    const today = new Date().toDateString();
    
    if (isAuth && authDate !== today) {
      sessionStorage.removeItem('dashboard_auth');
      sessionStorage.removeItem('dashboard_auth_date');
      return false;
    }
    return isAuth;
  });
  const [activeTab, setActiveTab] = useState<DashboardTab>('otp');
  
  const [records, setRecords] = useState<OTPRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [supportPhone, setSupportPhone] = useState(
    localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG?.supportPhone || ''
  );

  const formatNumber = (val: string) => {
    const raw = val.replace(/\D/g, '');
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [price, setPrice] = useState(
    formatNumber(localStorage.getItem(STORAGE_KEYS.PRICE) || '300000')
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodCategory[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return stored ? JSON.parse(stored) : (data?.payment?.methods || []);
  });

  const handleMethodChange = (categoryId: string, optionId: string, field: keyof PaymentMethodOption, value: any) => {
    setPaymentMethods((prev) => {
      const updated = prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            options: cat.options.map((opt) => {
              if (opt.id === optionId) {
                const finalValue = field === 'logo' && typeof value === 'string' ? value.trim() : value;
                return { ...opt, [field]: finalValue };
              }
              return opt;
            })
          };
        }
        return cat;
      });
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopyOtp = async (otp: string) => {
    try {
      await navigator.clipboard.writeText(otp);
      alert(TEXTS.dashboard.alerts.otpCopied);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = async (categoryId: string, optionId: string, field: keyof PaymentMethodOption) => {
    try {
      let text = await navigator.clipboard.readText();
      const category = paymentMethods.find(c => c.id === categoryId);
      const option = category?.options.find(o => o.id === optionId);
      
      if (field === 'account' && option && !option.isQris) {
        text = text.replace(/\D/g, '');
      }
      
      handleMethodChange(categoryId, optionId, field, text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert(TEXTS.dashboard.error.clipboard);
    }
  };

  const handleSaveMethods = async () => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
    await saveSetting('payment_methods', JSON.stringify(paymentMethods));
    alert(TEXTS.dashboard.alerts.paymentSaved);
  };

  const handleSaveSupportPhone = async () => {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_PHONE, supportPhone);
    await saveSetting('support_phone', supportPhone);
    alert(TEXTS.dashboard.alerts.supportPhoneSaved);
  };

  const handleSavePrice = async () => {
    const rawValue = price.replace(/\D/g, '');
    localStorage.setItem(STORAGE_KEYS.PRICE, rawValue || '0');
    await saveSetting('price', rawValue || '0');
    alert(TEXTS.dashboard.alerts.priceSaved);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatNumber(e.target.value));
  };

  useEffect(() => {
    const loadRecords = async () => {
      const data = await fetchOtpRecords();
      setRecords(data);
    };
    
    const loadSettings = async () => {
      const settings = await fetchSettings();
      if (Array.isArray(settings)) {
        settings.forEach((setting: any) => {
          if (setting.key === 'payment_methods') {
            try {
               setPaymentMethods(JSON.parse(setting.value));
               localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, setting.value);
            } catch (e) {}
          } else if (setting.key === 'support_phone') {
            setSupportPhone(setting.value);
            localStorage.setItem(STORAGE_KEYS.SUPPORT_PHONE, setting.value);
          } else if (setting.key === 'price') {
            setPrice(formatNumber(setting.value));
            localStorage.setItem(STORAGE_KEYS.PRICE, setting.value);
          }
        });
      }
    };

    loadRecords();
    loadSettings();
    
    const interval = setInterval(loadRecords, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkMidnightLogout = setInterval(() => {
      const authDate = sessionStorage.getItem('dashboard_auth_date');
      const today = new Date().toDateString();
      if (authDate && authDate !== today) {
        sessionStorage.removeItem('dashboard_auth');
        sessionStorage.removeItem('dashboard_auth_date');
        setIsAuthenticated(false);
      }
    }, 60000); 
    
    return () => clearInterval(checkMidnightLogout);
  }, [isAuthenticated]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredRecords = records.filter(record => 
    record.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.otp.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
  });

  const handleLogin = (username: string, password: string) => {
    if (
      username === DASHBOARD_CONFIG.adminUsername &&
      password === DASHBOARD_CONFIG.adminPassword
    ) {
      sessionStorage.setItem('dashboard_auth', 'true');
      sessionStorage.setItem('dashboard_auth_date', new Date().toDateString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth');
    sessionStorage.removeItem('dashboard_auth_date');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <DashboardLogin onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      <div className="space-y-12 pb-12">
        
        <div id="otp" className="scroll-mt-4">
          <OtpTable 
            records={records}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
            filteredRecords={filteredRecords}
            handleCopyOtp={handleCopyOtp}
          />
        </div>

        <div id="general" className="scroll-mt-4">
          <GeneralSettings 
            supportPhone={supportPhone}
            setSupportPhone={setSupportPhone}
            handleSaveSupportPhone={handleSaveSupportPhone}
            price={price}
            handlePriceChange={handlePriceChange}
            handleSavePrice={handleSavePrice}
          />
        </div>

        <div id="payment" className="scroll-mt-4">
          <PaymentSettings 
            paymentMethods={paymentMethods}
            handleSaveMethods={handleSaveMethods}
            handleMethodChange={handleMethodChange}
            handlePaste={handlePaste}
          />
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
