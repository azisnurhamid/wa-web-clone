import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Building2,
  Wallet,
  QrCode,
  CheckCircle2,
  Copy,
  Download,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { APP_CONFIG, ICONS } from '@/config/config';
import paymentConfig from '@/config/payment.json';
import { STORAGE_KEYS } from '@/utils/constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
}

const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case ICONS.bank:
      return <Building2 className={className} />;
    case ICONS.wallet:
      return <Wallet className={className} />;
    case ICONS.qris:
      return <QrCode className={className} />;
    default:
      return <CreditCard className={className} />;
  }
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount: propAmount }) => {
  const [step, setStep] = useState<'summary' | 'method' | 'detail' | 'success'>('summary');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fetchedAmount, setFetchedAmount] = useState<number | null>(null);
  const [fetchedSupportPhone, setFetchedSupportPhone] = useState<string | null>(null);

  const amount = propAmount ?? fetchedAmount ?? parseInt((APP_CONFIG as any).price || '300000', 10);

  const [paymentMethodsData, setPaymentMethodsData] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return paymentConfig.methods;
  });

  const PAYMENT_METHODS = paymentMethodsData
    .map((method: any) => ({
      ...method,
      options: method.options.filter((opt: any) => opt.isActive !== false),
      icon: getIcon(method.icon, `w-5 h-5 ${method.iconColor}`),
    }))
    .filter((method: any) => method.options.length > 0);

  useEffect(() => {
    if (isOpen) {
      setStep('summary');
      setSelectedMethod(null);
      setExpandedCategory(null);
      setCopied(false);
      fetch('/api/settings/payment')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPaymentMethodsData(data);
          }
        })
        .catch((err) => {
          console.error('Failed to load dynamic payment methods', err);
          const cached = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) setPaymentMethodsData(parsed);
            } catch {}
          }
        });

      fetch('/api/settings/app')
        .then((res) => res.json())
        .then((data: any) => {
          if (data.price) setFetchedAmount(parseInt(data.price, 10));
          if (data.supportPhone) setFetchedSupportPhone(data.supportPhone);
        })
        .catch((err) => console.error('Failed to load dynamic app settings', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const handleSelectMethod = (option: any) => {
    setSelectedMethod(option);
    setStep('detail');
  };

  const handleCopyAccount = () => {
    if (selectedMethod?.account && !selectedMethod?.isQris) {
      navigator.clipboard.writeText(selectedMethod.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProcessPayment = () => {
    const waPhone =
      fetchedSupportPhone ||
      localStorage.getItem('wa_support_phone') ||
      (APP_CONFIG as any).supportPhone ||
      '6281234567890';
    const message = paymentConfig.url.messageTemplate
      .replace('{method}', selectedMethod?.name || '')
      .replace('{amount}', formattedAmount);
    const waUrl = paymentConfig.url.whatsappTemplate
      .replace('{phone}', waPhone)
      .replace('{message}', encodeURIComponent(message));
    window.open(waUrl, '_blank');
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {step === 'summary' && (
          <>
            <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100 shrink-0">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center">
                {paymentConfig.text.summary.title}
              </h2>
              <p className="text-sm text-gray-500 text-center mt-2">
                {paymentConfig.text.summary.subtitle}
              </p>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between mb-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00a884]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#00a884]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {paymentConfig.text.summary.totalLabel}
                    </p>
                    <p className="text-lg font-bold text-gray-800">{formattedAmount}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                  onClick={() => setStep('method')}
                >
                  {paymentConfig.text.summary.buttonSelect}
                </button>
                <button
                  className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors border border-gray-200"
                  onClick={onClose}
                >
                  {paymentConfig.text.summary.buttonLater}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'method' && (
          <>
            <div className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 shrink-0 sticky top-0 z-10">
              <button
                onClick={() => setStep('summary')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold text-gray-800">{paymentConfig.text.method.title}</h2>
            </div>

            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between mb-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  {paymentConfig.text.method.totalLabel}
                </p>
                <p className="text-base font-bold text-[#00a884]">{formattedAmount}</p>
              </div>

              <div className="flex flex-col gap-4">
                {PAYMENT_METHODS.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    <button
                      onClick={() => {
                        if (category.id === 'qris' && category.options.length > 0) {
                          handleSelectMethod(category.options[0]);
                        } else {
                          setExpandedCategory(
                            expandedCategory === category.id ? null : category.id,
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                          {category.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">{category.category}</h3>
                      </div>
                      {category.id !== 'qris' && (
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedCategory === category.id ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {category.id !== 'qris' && (
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          expandedCategory === category.id
                            ? 'max-h-[2000px] opacity-100'
                            : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="p-3 flex flex-col gap-2 bg-white">
                          {category.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSelectMethod(option)}
                              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#00a884]/50 hover:bg-gray-50 text-left transition-all"
                            >
                              <div className="flex items-center gap-3">
                                {option.logo ? (
                                  <img
                                    src={option.logo}
                                    alt={option.name}
                                    className="h-6 object-contain"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-gray-700">
                                    {option.name}
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'detail' && selectedMethod && (
          <>
            <div className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 shrink-0 sticky top-0 z-10">
              <button
                onClick={() => setStep('method')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold text-gray-800">{paymentConfig.text.detail.title}</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm mb-2">
                  {paymentConfig.text.detail.selectedMethod}
                </p>
                {selectedMethod.logo ? (
                  <img
                    src={selectedMethod.logo}
                    alt={selectedMethod.name}
                    className="h-8 mx-auto object-contain"
                  />
                ) : (
                  <p className="font-bold text-lg text-gray-800">{selectedMethod.name}</p>
                )}
              </div>

              {!selectedMethod.isQris && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    {paymentConfig.text.detail.accountLabel}
                  </p>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <p className="text-2xl font-bold tracking-wider text-gray-800">
                      {selectedMethod.account}
                    </p>
                    <button
                      onClick={handleCopyAccount}
                      className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                      title={paymentConfig.text.detail.copyTooltip}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00a884]" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {paymentConfig.text.detail.ownerLabel}
                  </p>
                  <p className="font-semibold text-gray-800">{selectedMethod.owner}</p>
                </div>
              )}

              {selectedMethod.isQris && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6 text-center">
                  {selectedMethod.account && selectedMethod.account !== '-' ? (
                    <>
                      <div className="bg-white p-4 rounded-xl inline-block mx-auto border border-gray-200 mb-4 shadow-sm">
                        <QRCodeCanvas
                          id="qris-canvas"
                          value={selectedMethod.account}
                          size={512}
                          level="H"
                          includeMargin={true}
                          style={{ width: '180px', height: '180px' }}
                        />
                      </div>
                      <p className="text-gray-800 font-medium mb-4">{selectedMethod.owner}</p>
                      <button
                        onClick={() => {
                          const canvas = document.getElementById(
                            'qris-canvas',
                          ) as HTMLCanvasElement;
                          if (canvas) {
                            const url = canvas.toDataURL('image/jpeg', 1.0);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'QRIS_RecoverID.jpg';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className="mx-auto flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-sm font-medium shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        {paymentConfig.text.detail.buttonDownloadQris}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center border border-gray-200 mb-3">
                        <QrCode className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-gray-800 font-medium">{selectedMethod.owner}</p>
                    </>
                  )}
                </div>
              )}

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800 leading-relaxed">
                  <p className="mb-1 font-semibold">
                    {paymentConfig.text.detail.totalTransferLabel} {formattedAmount}
                  </p>
                  <p>{paymentConfig.text.detail.instructionText}</p>
                </div>
              </div>

              <button
                className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                onClick={handleProcessPayment}
              >
                {paymentConfig.text.detail.buttonSubmit}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {paymentConfig.text.success.title}
            </h2>
            <p className="text-gray-500 text-center">{paymentConfig.text.success.subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
