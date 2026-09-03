import React, { useState, useEffect } from 'react';
import { TEXTS } from '@/config/config';
import { WelcomeScreen } from './WelcomeScreen';
import { PhoneInputScreen } from './PhoneInputScreen';
import { OtpVerifyScreen } from './OtpVerifyScreen';

const T = TEXTS.welcomePage;

interface WelcomePageProps {
  onComplete: () => void;
}

const formatPhoneDisplay = (code: string, number: string): string => {
  const digits = number.replace(/\D/g, '');
  if (digits.length <= 3) return `${code} ${digits}`;
  if (digits.length <= 7) return `${code} ${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${code} ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const WelcomePage: React.FC<WelcomePageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'phone' | 'verify'>(() => {
    return (localStorage.getItem('auth_step') as any) || 'welcome';
  });

  useEffect(() => {
    localStorage.setItem('auth_step', step);
    if (window.history.state?.step !== step) {
      window.history.pushState({ step }, '', window.location.pathname);
    }
  }, [step]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.step) {
        setStep(e.state.step);
      } else {
        setStep('welcome');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    if (!window.history.state || !window.history.state.step) {
      window.history.replaceState({ step }, '', window.location.pathname);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [showWelcomeMenu, setShowWelcomeMenu] = useState(false);
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);
  const [showVerifyMenu, setShowVerifyMenu] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem('auth_phone_number') || '';
  });
  const [countryCode, setCountryCode] = useState(() => {
    return localStorage.getItem('auth_country_code') || T.phone.defaultCountryCode;
  });
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('auth_selected_country') || T.phone.defaultCountry;
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showVerifyMethodSheet, setShowVerifyMethodSheet] = useState(false);
  const [selectedVerifyMethod, setSelectedVerifyMethod] = useState<'sms' | 'missed_call' | 'voice'>(
    'sms',
  );

  useEffect(() => {
    if (phoneNumber) {
      localStorage.setItem('auth_phone_number', phoneNumber);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (countryCode) {
      localStorage.setItem('auth_country_code', countryCode);
    }
  }, [countryCode]);

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem('auth_selected_country', selectedCountry);
    }
  }, [selectedCountry]);

  const formattedPhone = formatPhoneDisplay(countryCode, phoneNumber);

  const checkAttemptLimit = (): boolean => {
    const now = Date.now();
    const attemptsStr = localStorage.getItem('OTP_ATTEMPTS');
    let attempts = attemptsStr ? JSON.parse(attemptsStr) : [];

    const oneDayMs = 24 * 60 * 60 * 1000;
    attempts = attempts.filter((t: number) => now - t < oneDayMs);

    if (attempts.length >= 4) {
      alert(T.verify.maxAttempts);
      return false;
    }

    attempts.push(now);
    localStorage.setItem('OTP_ATTEMPTS', JSON.stringify(attempts));
    return true;
  };

  const handleRequestOTP = async (): Promise<boolean> => {
    if (!checkAttemptLimit()) {
      return false;
    }
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const createdAtMs = Date.now();
      const createdAtIso = new Date(createdAtMs).toISOString();
      localStorage.setItem('current_otp_created_at', createdAtMs.toString());

      const newRequest = {
        id: createdAtMs,
        phoneNumber: formattedPhone,
        country: selectedCountry,
        otp: otp,
        created_at: createdAtIso,
      };

      await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      return true;
    } catch (e) {
      console.error('Failed to save OTP request to server', e);
      return false;
    }
  };

  if (step === 'welcome') {
    return (
      <WelcomeScreen
        onNext={() => setStep('phone')}
        showMenu={showWelcomeMenu}
        setShowMenu={setShowWelcomeMenu}
      />
    );
  }

  if (step === 'phone') {
    return (
      <PhoneInputScreen
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        onNext={() => {
          if (phoneNumber.length >= 8) {
            setShowConfirmDialog(true);
          }
        }}
        onConfirm={async () => {
          setShowConfirmDialog(false);
          const ok = await handleRequestOTP();
          if (ok) {
            setStep('verify');
          }
        }}
        showMenu={showPhoneMenu}
        setShowMenu={setShowPhoneMenu}
        showCountryDropdown={showCountryDropdown}
        setShowCountryDropdown={setShowCountryDropdown}
        formattedPhone={formattedPhone}
      />
    );
  }

  return (
    <OtpVerifyScreen
      formattedPhone={formattedPhone}
      onBack={() => {
        setStep('phone');
        setOtpDigits(['', '', '', '', '', '']);
      }}
      onComplete={onComplete}
      showMenu={showVerifyMenu}
      setShowMenu={setShowVerifyMenu}
      otpDigits={otpDigits}
      setOtpDigits={setOtpDigits}
      showVerifyMethodSheet={showVerifyMethodSheet}
      setShowVerifyMethodSheet={setShowVerifyMethodSheet}
      selectedVerifyMethod={selectedVerifyMethod}
      setSelectedVerifyMethod={setSelectedVerifyMethod}
      onRequestNewOTP={handleRequestOTP}
    />
  );
};

export default WelcomePage;
