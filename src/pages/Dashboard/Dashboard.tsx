import React, { useState, useEffect } from 'react';
import { ClipboardPaste, Copy, Search, ArrowDown, ArrowUp } from 'lucide-react';
import { TEXTS, APP_CONFIG } from '../../config/config';
import paymentConfig from '../../config/payment.json';
import { OTPRecord, PaymentMethodCategory, PaymentMethodOption } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';
import { fetchOtpRecords } from '../../services/api';
import { OtpTable } from './components/OtpTable';
import { GeneralSettings } from './components/GeneralSettings';
import { PaymentSettings } from './components/PaymentSettings';
import { DashboardLayout, DashboardTab } from './components/DashboardLayout';


export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('otp');
  
  const [records, setRecords] = useState<OTPRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [supportPhone, setSupportPhone] = useState(
    localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone
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
    return stored ? JSON.parse(stored) : paymentConfig.methods;
  });

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
      alert('OTP berhasil disalin!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = async (categoryId: string, optionId: string, field: keyof PaymentMethodOption) => {
    try {
      const text = await navigator.clipboard.readText();
      handleMethodChange(categoryId, optionId, field, text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Gagal mengambil teks dari clipboard. Pastikan browser memberikan izin akses clipboard.');
    }
  };

  const handleSaveMethods = () => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
    alert('Metode Pembayaran berhasil disimpan!');
  };

  const handleSaveSupportPhone = () => {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_PHONE, supportPhone);
    alert('Nomor bantuan berhasil disimpan!');
  };

  const handleSavePrice = () => {
    const rawValue = price.replace(/\D/g, '');
    localStorage.setItem(STORAGE_KEYS.PRICE, rawValue || '0');
    alert('Harga berhasil disimpan!');
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

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredRecords = records.filter(record => 
    record.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.otp.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.country.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
  });

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-8">
        
        {activeTab === 'otp' && (
          <OtpTable 
            records={records}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
            filteredRecords={filteredRecords}
            handleCopyOtp={handleCopyOtp}
          />
        )}

        {activeTab === 'general' && (
          <GeneralSettings 
            supportPhone={supportPhone}
            setSupportPhone={setSupportPhone}
            handleSaveSupportPhone={handleSaveSupportPhone}
            price={price}
            handlePriceChange={handlePriceChange}
            handleSavePrice={handleSavePrice}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentSettings 
            paymentMethods={paymentMethods}
            handleSaveMethods={handleSaveMethods}
            handleMethodChange={handleMethodChange}
            handlePaste={handlePaste}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
