import React, { useState, useEffect } from 'react';
import { TEXTS } from '../../config/config';
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
        onConfirm={() => {
          setShowConfirmDialog(false);
          setStep('verify');
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
    />
  );
};

export default WelcomePage;
