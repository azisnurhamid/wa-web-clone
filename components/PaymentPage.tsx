import React, { useState } from 'react';
import { X, Check, CreditCard, Smartphone, Wallet, Building, ArrowLeft, Lock } from 'lucide-react';
import { APP_CONFIG, COLORS } from '../config';

interface PaymentPageProps {
  packageId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ packageId, onBack, onSuccess }) => {
  const packages = APP_CONFIG.app.packages || [];
  const selectedPackage = packages.find((p: any) => p.id === packageId) || packages[0];
  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'qris', name: 'QRIS', icon: Smartphone, desc: 'Scan QR dengan aplikasi banking' },
    { id: 'transfer', name: 'Transfer Bank', icon: Building, desc: 'BCA, BRI, Mandiri,BNI' },
    { id: 'ewallet', name: 'E-Wallet', icon: Wallet, desc: 'GoPay, OVO, DANA, ShopeePay' },
    { id: 'credit', name: 'Kartu Kredit', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-gradient-to-br from-gray-900 to-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00a884] to-[#00c896] py-6 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Metode Pembayaran</h1>
            <p className="text-white/80 text-sm">Pilih metode pembayaran yang方便</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
          <h2 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-800">{selectedPackage.name}</p>
              <p className="text-sm text-gray-500">{selectedPackage.period}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#00a884] text-xl">{selectedPackage.price}</p>
              {selectedPackage.originalPrice && (
                <p className="text-sm text-gray-400 line-through">{selectedPackage.originalPrice}</p>
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-between items-center">
            <p className="font-semibold text-gray-800">Total</p>
            <p className="font-bold text-[#00a884] text-2xl">{selectedPackage.price}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
          <h2 className="font-bold text-gray-800 mb-4">Pilih Metode Pembayaran</h2>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-[#00a884] bg-[#00a884]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'bg-[#00a884] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <method.icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{method.name}</p>
                  <p className="text-sm text-gray-500">{method.desc}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <Lock size={20} className="text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Pembayaran Aman</p>
            <p className="text-blue-600 text-xs">Data Anda terenkripsi dan aman</p>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isProcessing
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00a884] to-[#00c896] text-white hover:shadow-lg hover:shadow-[#00a884]/30'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Pembayaran...
            </span>
          ) : (
            `Bayar ${selectedPackage.price}`
          )}
        </button>

        {/* Cancel */}
        <button
          onClick={onBack}
          className="w-full py-3 mt-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
