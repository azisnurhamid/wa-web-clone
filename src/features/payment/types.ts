export interface PaymentMethodOption {
  id: string;
  name: string;
  logo?: string;
  account: string;
  owner: string;
  isActive?: boolean;
  isQris?: boolean;
}

export interface PaymentMethodCategory {
  id: string;
  category: string;
  icon: string;
  iconColor: string;
  options: PaymentMethodOption[];
}
