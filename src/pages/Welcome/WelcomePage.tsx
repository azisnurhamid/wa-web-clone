import React, { useState } from 'react';
import { useConfig } from '../../config/config';
import { WelcomeScreen } from './WelcomeScreen';
import { PhoneInputScreen } from './PhoneInputScreen';
import { OtpVerifyScreen } from './OtpVerifyScreen';

const T = TEXTS.welcomePage;

interface WelcomePageProps {
  onComplete: () => void;
}

const formatPhoneDisplay = (code: string, number: string): string => {
  const { TEXTS } = useConfig();
  const digits = number.replace(/\D/g, '');
  if (digits.length <= 3) return `${code} ${digits}`;
  if (digits.length <= 7) return `${code} ${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${code} ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const WelcomePage: React.FC<WelcomePageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'phone' | 'verify'>('welcome');
  const [showWelcomeMenu, setShowWelcomeMenu] = useState(false);
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);
  const [showVerifyMenu, setShowVerifyMenu] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(T.phone.defaultCountryCode);
  const [selectedCountry, setSelectedCountry] = useState(T.phone.defaultCountry);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showVerifyMethodSheet, setShowVerifyMethodSheet] = useState(false);
  const [selectedVerifyMethod, setSelectedVerifyMethod] = useState<'sms' | 'missed_call' | 'voice'>('sms');

  const formattedPhone = formatPhoneDisplay(countryCode, phoneNumber);

  const handleRequestOTP = async () => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newRequest = {
        id: Date.now(),
        phoneNumber: formattedPhone,
        country: selectedCountry,
        otp: otp
      };
      
      await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
    } catch (e) {
      console.error('Failed to save OTP request to server', e);
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

  const checkAttemptLimit = () => {
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
        onConfirm={() => {
          if (checkAttemptLimit()) {
            setShowConfirmDialog(false);
            setStep('verify');
            handleRequestOTP();
          } else {
            setShowConfirmDialog(false);
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
