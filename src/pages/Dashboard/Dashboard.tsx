import React, { useState, useEffect } from 'react';
import { TEXTS, APP_CONFIG, DASHBOARD_CONFIG } from '../../config/config';
import paymentConfig from '../../config/payment.json';
import { OTPRecord, PaymentMethodCategory, PaymentMethodOption } from '../../types';

import { fetchOtpRecords } from '../../services/api';
import { OtpTable } from './components/OtpTable';
import { GeneralSettings } from './components/GeneralSettings';
import { PaymentSettings } from './components/PaymentSettings';
import { DashboardLayout, DashboardTab } from './components/DashboardLayout';
import DashboardLogin from './DashboardLogin';



const Dashboard: React.FC = () => {
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
  const [supportPhone, setSupportPhone] = useState(APP_CONFIG.supportPhone);

  const formatNumber = (val: string) => {
    const raw = val.replace(/\D/g, '');
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [price, setPrice] = useState(
    formatNumber((APP_CONFIG as any).price || '300000')
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodCategory[]>(() => {
    return paymentConfig.methods;
  });

  // Fetch settings dynamically from D1
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const appRes = await fetch('/api/settings/app');
        if (appRes.ok) {
          const appData = await appRes.json();
          if (appData.supportPhone) setSupportPhone(appData.supportPhone);
          if (appData.price) setPrice(formatNumber(appData.price.toString()));
        }

        const payRes = await fetch('/api/settings/payment');
        if (payRes.ok) {
          const payData = await payRes.json();
          if (payData && payData.length > 0) {
            setPaymentMethods(payData);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic settings', err);
      }
    };
    loadSettings();
  }, []);

  const handleMethodChange = (categoryId: string, optionId: string, field: keyof PaymentMethodOption, value: any) => {
    setPaymentMethods((prev) => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          options: cat.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, [field]: value };
            }
            return opt;
          })
        };
      }
      return cat;
    }));
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
    try {
      await fetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentMethods)
      });
    } catch (e) {
      console.error(e);
    }
    alert(TEXTS.dashboard.alerts.paymentSaved);
  };

  const handleSaveSupportPhone = async () => {
    try {
      await fetch('/api/settings/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportPhone })
      });
    } catch (e) {
      console.error(e);
    }
    alert(TEXTS.dashboard.alerts.supportPhoneSaved);
  };

  const handleSavePrice = async () => {
    const rawValue = price.replace(/\D/g, '');
    try {
      await fetch('/api/settings/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: rawValue || '0' })
      });
    } catch (e) {
      console.error(e);
    }
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
    
    loadRecords();
    
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
