
export interface StatusUpdate {
  id: string;
  type: 'image' | 'text';
  content: string; // Image URL or Text content
  caption?: string;
  timestamp: string;
  isViewed: boolean;
  color?: string; // Background color for text status
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  about?: string;
  statusUpdates?: StatusUpdate[]; // New field for stories
  phoneNumber?: string; // New field for phone number
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
  unreadCount: number;
  messages: Message[];
  pinned?: boolean;
  archived?: boolean;
}
