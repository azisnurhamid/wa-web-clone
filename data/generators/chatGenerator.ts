
import { ChatSession, Message, User } from '../../types';
import { GREETINGS, QUESTIONS, STATEMENTS, LONG_MESSAGES, BUSINESS_TALK } from '../seeds/conversations';
import { generateTimestamp, getRandomBoolean, getRandomInt, getRandomItem } from '../utils/helpers';

const ALL_TEXTS = [...GREETINGS, ...QUESTIONS, ...STATEMENTS, ...LONG_MESSAGES, ...BUSINESS_TALK];

const generateMessageHistory = (count: number, startMinuteOffset: number): Message[] => {
  const messages: Message[] = [];
  let currentOffset = startMinuteOffset;

  for (let i = 0; i < count; i++) {
    // Gap between messages (1 min to 3 hours)
    const gap = getRandomInt(1, 180); 
    currentOffset += gap;
    
    // Determine message status
    const isMine = getRandomBoolean(0.4);
    let status: 'sent' | 'delivered' | 'read' = 'read';
    if (currentOffset < 10) { // Very recent
       status = getRandomItem(['sent', 'delivered', 'read']);
    }

    messages.push({
      id: `msg_${Date.now()}_${i}`,
      text: getRandomItem(ALL_TEXTS),
      timestamp: generateTimestamp(currentOffset),
      isMine,
      status,
    });
  }

  // Reverse so newest is last in array (chronological order)
  return messages.reverse();
};

export const generateChatSession = (user: User, isGroup = false, isArchived = false, isPinned = false): ChatSession => {
  // Random message count between 5 and 500
  const msgCount = getRandomInt(5, 500); 
  // Last message was between 0 mins ago and 10 days (14400 mins) ago
  const lastActiveMinutes = getRandomInt(0, 14400); 

  const messages = generateMessageHistory(msgCount, lastActiveMinutes);
  const lastMsgObj = messages[messages.length - 1];

  return {
    id: `chat_${user.id}`,
    user,
    lastMessage: lastMsgObj.text,
    lastMessageTime: lastMsgObj.timestamp,
    unreadCount: getRandomBoolean(0.2) ? getRandomInt(1, 15) : 0, // 20% chance of unread
    messages,
    pinned: isPinned,
    archived: isArchived,
  };
};
