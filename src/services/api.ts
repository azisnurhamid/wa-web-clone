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
export const fetchSettings = async () => {
  try {
    const res = await fetch(`/api/settings?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch settings', e);
    return [];
  }
};

export const saveSetting = async (key: string, value: string) => {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch (e) {
    console.error('Failed to save setting', e);
    return null;
  }
};
