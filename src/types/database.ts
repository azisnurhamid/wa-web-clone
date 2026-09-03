export interface OtpRequest {
  id: number;
  phoneNumber: string;
  country: string | null;
  otp: string;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: string;
}
