import { OTPRecord } from '@/types';

export const fetchOtpRecords = async (): Promise<OTPRecord[]> => {
  try {
    const res = await fetch(`/api/otp?t=${Date.now()}`);
    if (res.ok) {
      const data: any = await res.json();
      return data;
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch OTP records', e);
    return [];
  }
};

export const getAppSettings = async (): Promise<any> => {
  try {
    const res = await fetch('/api/settings/app');
    if (res.ok) {
      return await res.json();
    }
    return {};
  } catch (e) {
    console.error('Failed to fetch app settings', e);
    return {};
  }
};
