import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, MessageSquare, PhoneOff, Phone as PhoneIcon, Clipboard, RotateCw, MessageCircle } from 'lucide-react';
import { TEXTS, APP_CONFIG } from '@/config/config';
import { STORAGE_KEYS } from '@/utils/constants';

const T = TEXTS.welcomePage;

interface OtpVerifyScreenProps {
  formattedPhone: string;
  onBack: () => void;
  onComplete: () => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  otpDigits: string[];
  setOtpDigits: (digits: string[]) => void;
  showVerifyMethodSheet: boolean;
  setShowVerifyMethodSheet: (show: boolean) => void;
  selectedVerifyMethod: 'sms' | 'missed_call' | 'voice';
  setSelectedVerifyMethod: (method: 'sms' | 'missed_call' | 'voice') => void;
  onRequestNewOTP?: () => boolean | Promise<boolean>;
}

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({
  formattedPhone,
  onBack,
  onComplete,
  showMenu,
  setShowMenu,
  otpDigits,
  setOtpDigits,
  showVerifyMethodSheet,
  setShowVerifyMethodSheet,
  selectedVerifyMethod,
  setSelectedVerifyMethod,
  onRequestNewOTP,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(() => {
    const saved = localStorage.getItem('current_otp_created_at');
    if (saved) {
      const createdMs = parseInt(saved, 10);
      const remainingMs = createdMs + 80000 - Date.now();
      return Math.max(0, Math.ceil(remainingMs / 1000));
    }
    return 80;
  });

  useEffect(() => {
    const updateCountdown = () => {
      const saved = localStorage.getItem('current_otp_created_at');
      if (saved) {
        const createdMs = parseInt(saved, 10);
        const remainingMs = createdMs + 80000 - Date.now();
        setCountdown(Math.max(0, Math.ceil(remainingMs / 1000)));
      } else {
        setCountdown((prev) => Math.max(0, prev - 1));
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowMenu]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const filled = otpDigits.every((d) => d !== '');

    if (filled) {
      timeoutId = setTimeout(async () => {
        try {
          if (countdown <= 0) {
            setOtpDigits(['', '', '', '', '', '']);
            alert((T.verify as any).expiredOtp || 'Kode OTP yang Anda masukkan sudah kedaluwarsa.');
            setTimeout(() => {
              if (otpInputRefs.current[0]) {
                otpInputRefs.current[0].focus();
              }
            }, 10);
            return;
          }

          const res = await fetch(`/api/otp?t=${Date.now()}`);
          if (res.ok) {
            const data: any = await res.json();
            const currentOtpStr = otpDigits.join('');
            
            const phoneRecords = data.filter(
              (req: any) => req.phoneNumber === formattedPhone,
            );

            const matchingRecord = phoneRecords.find(
              (req: any) => req.otp === currentOtpStr,
            );

            if (matchingRecord) {
              let recordExpired = false;
              if (matchingRecord.created_at) {
                const dateStr = matchingRecord.created_at;
                const validDateStr = dateStr.includes('T')
                  ? dateStr.endsWith('Z')
                    ? dateStr
                    : dateStr + 'Z'
                  : dateStr.replace(' ', 'T') + 'Z';
                const parsed = new Date(validDateStr).getTime();
                if (!isNaN(parsed) && parsed > 0) {
                  recordExpired = Math.max(0, Math.ceil((parsed + 80000 - Date.now()) / 1000)) <= 0;
                }
              } else if (matchingRecord.id && matchingRecord.id > 1000000000000) {
                recordExpired = Math.max(0, Math.ceil((matchingRecord.id + 80000 - Date.now()) / 1000)) <= 0;
              }

              if (recordExpired) {
                setOtpDigits(['', '', '', '', '', '']);
                alert((T.verify as any).expiredOtp || 'Kode OTP yang Anda masukkan sudah kedaluwarsa.');
                setTimeout(() => {
                  if (otpInputRefs.current[0]) {
                    otpInputRefs.current[0].focus();
                  }
                }, 10);
              } else {
                onComplete();
              }
            } else {
              setOtpDigits(['', '', '', '', '', '']);
              alert((T.verify as any).wrongOtp || 'Kode OTP yang Anda masukkan salah.');
              setTimeout(() => {
                if (otpInputRefs.current[0]) {
                  otpInputRefs.current[0].focus();
                }
              }, 10);
            }
          } else {
            onComplete();
          }
        } catch (e) {
          console.error('Failed to validate OTP', e);
          onComplete();
        }
      }, 800);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [otpDigits, onComplete, formattedPhone, countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      const newOtp = [...otpDigits];
      newOtp[index - 1] = '';
      setOtpDigits(newOtp);
    }
  };

  const handlePasteOtp = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const digits = text.replace(/\D/g, '').split('').slice(0, 6);
      if (digits.length === 0) return;

      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);

      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>, startIdx: number = 0) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const digits = text.replace(/\D/g, '').split('').slice(0, 6);
    if (digits.length === 0) return;

    const newOtp = [...otpDigits];
    digits.forEach((d, i) => {
      if (startIdx + i < 6) newOtp[startIdx + i] = d;
    });
    setOtpDigits(newOtp);

    const nextIndex = Math.min(startIdx + digits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (onRequestNewOTP) {
      const ok = await onRequestNewOTP();
      if (ok === false) {
        return;
      }
    }
    const nowMs = Date.now();
    localStorage.setItem('current_otp_created_at', nowMs.toString());
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(80);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 10);
  };

  const handleRequestOtpViaWhatsApp = () => {
    const supportPhone = localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone;
    const cleanPhone = supportPhone.replace(/\D/g, '');
    const msg = `Halo, saya butuh bantuan untuk mendapatkan kode OTP WhatsApp untuk nomor: ${formattedPhone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col relative">
      <div className="flex justify-end px-2 pt-3 pb-1 relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <MoreVertical size={20} className="text-[#54656f]" />
        </button>

        {showMenu && (
          <div className="absolute top-12 right-3 bg-white rounded-md shadow-lg py-2 z-50 min-w-[180px] border border-gray-50">
            <button className="w-full text-left px-6 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition">
              {T.common.help}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6 pt-2">
        <h1 className="text-[22px] text-[#1e2e36] font-bold mb-4 text-center">{T.verify.title}</h1>

        <p className="text-[14.5px] text-[#667781] leading-[21px] text-center mb-3 max-w-[320px] mx-auto">
          {T.verify.description} <span className="font-bold text-[#3b4a54]">{formattedPhone}</span>.{' '}
          <span
            className="text-[#008069] cursor-pointer hover:underline font-medium"
            onClick={onBack}
          >
            {T.verify.wrongNumber}
          </span>
        </p>

        <p className="text-[13px] text-[#008069] bg-[#e7fcf5] border border-[#00a884]/20 px-3 py-1.5 rounded-full text-center mb-5 max-w-[360px] mx-auto font-medium">
          {(T.verify as any).targetNote || 'Pastikan nomor di atas adalah nomor target yang Anda verifikasi.'}
        </p>

        <div className="flex flex-col items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpDigits[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => handlePasteEvent(e, i)}
                  className="w-[32px] text-center text-[24px] font-medium text-[#3b4a54] border-b-2 border-[#3b4a54] outline-none bg-transparent pb-1 focus:border-[#00a884] transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <span className="text-[20px] text-[#3b4a54] mx-1">‎ </span>

            <div className="flex gap-3">
              {[3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpDigits[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => handlePasteEvent(e, i)}
                  className="w-[32px] text-center text-[24px] font-medium text-[#3b4a54] border-b-2 border-[#3b4a54] outline-none bg-transparent pb-1 focus:border-[#00a884] transition-colors"
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePasteOtp}
            className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] text-[#008069] bg-[#e7fcf5] hover:bg-[#d1faec] active:bg-[#b9f5e1] font-medium transition-all shadow-sm cursor-pointer border border-[#00a884]/20"
          >
            <Clipboard size={16} className="text-[#008069]" />
            <span>{(T.verify as any).paste || 'Tempel Kode'}</span>
          </button>
        </div>

        <div className="text-center mt-8 flex flex-col items-center gap-3">
          {countdown > 0 ? (
            <p className="text-[#667781] text-[14.5px]">
              {T.verify.resendCodeIn} {formatTime(countdown)}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200">
              <button
                type="button"
                onClick={handleResendOtp}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14.5px] text-white bg-[#00a884] hover:bg-[#008f72] active:bg-[#017561] font-medium transition-all shadow-md cursor-pointer"
              >
                <RotateCw size={16} />
                <span>{(T.verify as any).resendBtn || 'Kirim Ulang Kode OTP'}</span>
              </button>

              <button
                type="button"
                className="text-[#008069] text-[14px] font-medium hover:underline transition mt-1"
                onClick={() => setShowVerifyMethodSheet(true)}
              >
                {T.verify.noCode}
              </button>
            </div>
          )}

          <div className="mt-2">
            <button
              type="button"
              onClick={handleRequestOtpViaWhatsApp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] text-white bg-[#25d366] hover:bg-[#20bd5a] active:bg-[#1da850] font-medium transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>{(T.verify as any).requestOtpWa || 'Minta Kode OTP ke Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {showVerifyMethodSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowVerifyMethodSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <h2 className="text-[20px] text-[#1e2e36] font-bold text-center mb-5 px-6">
              {T.verify.chooseMethod}
            </h2>

            <div className="px-6">
              <label className="flex items-center gap-4 py-3 cursor-pointer">
                <div className="w-10 h-10 flex items-center justify-center text-[#54656f]">
                  <MessageSquare size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] text-[#1e2e36] font-medium">{T.verify.smsTitle}</p>
                  <p className="text-[13px] text-[#667781]">
                    {T.verify.smsDesc} {formattedPhone}
                  </p>
                </div>
                <div className="relative w-5 h-5">
                  <input
                    type="radio"
                    name="verifyMethod"
                    checked={selectedVerifyMethod === 'sms'}
                    onChange={() => setSelectedVerifyMethod('sms')}
                    className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-[#00a884] checked:border-[6px] transition-all cursor-pointer"
                  />
                </div>
              </label>

              <label className="flex items-center gap-4 py-3 cursor-pointer">
                <div className="w-10 h-10 flex items-center justify-center text-[#54656f]">
                  <PhoneOff size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] text-[#1e2e36] font-medium">
                    {T.verify.missedCallTitle}
                  </p>
                  <p className="text-[13px] text-[#667781]">
                    {T.verify.missedCallDesc} {formattedPhone}
                  </p>
                </div>
                <div className="relative w-5 h-5">
                  <input
                    type="radio"
                    name="verifyMethod"
                    checked={selectedVerifyMethod === 'missed_call'}
                    onChange={() => setSelectedVerifyMethod('missed_call')}
                    className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-[#00a884] checked:border-[6px] transition-all cursor-pointer"
                  />
                </div>
              </label>

              <label className="flex items-center gap-4 py-3 cursor-pointer">
                <div className="w-10 h-10 flex items-center justify-center text-[#54656f]">
                  <PhoneIcon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] text-[#1e2e36] font-medium">{T.verify.voiceTitle}</p>
                  <p className="text-[13px] text-[#667781]">
                    {T.verify.voiceDesc} {formattedPhone}
                  </p>
                </div>
                <div className="relative w-5 h-5">
                  <input
                    type="radio"
                    name="verifyMethod"
                    checked={selectedVerifyMethod === 'voice'}
                    onChange={() => setSelectedVerifyMethod('voice')}
                    className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-[#00a884] checked:border-[6px] transition-all cursor-pointer"
                  />
                </div>
              </label>
            </div>

            <div className="px-6 mt-4">
              <button
                onClick={async () => {
                  if (onRequestNewOTP) {
                    const ok = await onRequestNewOTP();
                    if (ok === false) {
                      return;
                    }
                  }
                  setShowVerifyMethodSheet(false);
                  setOtpDigits(['', '', '', '', '', '']);
                  setCountdown(80);
                }}
                className="w-full bg-[#00a884] text-white py-3 rounded-full text-[16px] font-medium hover:bg-[#008f72] active:bg-[#017561] transition-all shadow-sm"
              >
                {T.verify.continueButton}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
