
export interface StatusUpdate {
  id: string;
  type: 'image' | 'text';
  content: string;
  caption?: string;
  timestamp: string;
  isViewed: boolean;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  about?: string;
  statusUpdates?: StatusUpdate[];
  phoneNumber?: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageTimestamp: number;
  unreadCount: number;
  messages: Message[];
  archived?: boolean;
  pinned?: boolean;
  isTyping?: boolean;
}

export interface OTPRecord {
  id: number;
  phoneNumber: string;
  country: string;
  otp: string;
  created_at: string;
}

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
