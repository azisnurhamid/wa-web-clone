import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, MessageSquare, PhoneOff, Phone as PhoneIcon } from 'lucide-react';
import { TEXTS } from '@/config/config';

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
  onRequestNewOTP?: () => void;
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
  const [countdown, setCountdown] = useState(80);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
          const res = await fetch(`/api/otp?t=${Date.now()}`);
          if (res.ok) {
            const data: any = await res.json();
            const currentOtpStr = otpDigits.join('');
            const matchingRecord = data.find(
              (req: any) => req.phoneNumber === formattedPhone && req.otp === currentOtpStr,
            );

            if (matchingRecord) {
              onComplete();
            } else {
              setOtpDigits(['', '', '', '', '', '']);
              alert(T.verify.invalidOtp);
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
  }, [otpDigits, onComplete, formattedPhone]);

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

        <p className="text-[14.5px] text-[#667781] leading-[21px] text-center mb-6 max-w-[320px] mx-auto">
          {T.verify.description} <span className="font-bold text-[#3b4a54]">{formattedPhone}</span>.{' '}
          <span
            className="text-[#008069] cursor-pointer hover:underline font-medium"
            onClick={onBack}
          >
            {T.verify.wrongNumber}
          </span>
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
                  className="w-[32px] text-center text-[24px] font-medium text-[#3b4a54] border-b-2 border-[#3b4a54] outline-none bg-transparent pb-1 focus:border-[#00a884] transition-colors"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          {countdown > 0 ? (
            <p className="text-[#667781] text-[14.5px]">
              {T.verify.resendCodeIn} {formatTime(countdown)}
            </p>
          ) : (
            <button
              className="text-[#008069] text-[14.5px] font-medium hover:underline transition"
              onClick={() => setShowVerifyMethodSheet(true)}
            >
              {T.verify.noCode}
            </button>
          )}
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
                onClick={() => {
                  setShowVerifyMethodSheet(false);
                  setOtpDigits(['', '', '', '', '', '']);
                  if (onRequestNewOTP) {
                    onRequestNewOTP();
                  }
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
