import { OTPRecord } from '../types';

export const fetchOtpRecords = async (): Promise<OTPRecord[]> => {
  try {
    const res = await fetch(`/api/otp?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch OTP records', e);
    return [];
  }
};
