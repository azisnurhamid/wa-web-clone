
import { ChatSession, Message, StatusUpdate, User } from '../types';
import { GREETINGS, QUESTIONS, STATEMENTS, BUSINESS_TALK } from './seeds/conversations';
import { getRandomItem, getRandomInt, generateTimestamp, getRandomBoolean } from './utils/helpers';
import { ROMANTIC_SCRIPT } from './seeds/romance';

// Helper for "AI" Text Generation
const getRandomMessageText = (isSpecialUser: boolean): string => {
  if (isSpecialUser) {
    const romanticTexts = [
      "Kangen deh 🥺", "Lagi apa sayang?", "Jangan lupa makan ya ❤️", 
      "Nanti video call yuk?", "Sticker: ❤️", "I love you 3000",
      "Pap dongg", "Hati-hati di jalan yaa", "Semangat kerjanya sayang!"
    ];
    return getRandomItem(romanticTexts);
  }
  
  // Mix of different types for regular users
  const category = getRandomInt(1, 4);
  switch (category) {
    case 1: return getRandomItem(GREETINGS);
    case 2: return getRandomItem(QUESTIONS);
    case 3: return getRandomItem(STATEMENTS);
    case 4: return getRandomItem(BUSINESS_TALK);
    default: return "Oke";
  }
};

export const createIncomingMessage = (chat: ChatSession): Message => {
  const isSpecial = chat.id === 'chat_special_1';
  
  return {
    id: `msg_auto_${Date.now()}`,
    text: getRandomMessageText(isSpecial),
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
    isMine: false, // Incoming message
    status: 'read', // Doesn't matter for incoming
  };
};

export const createNewStatusUpdate = (userId: string): StatusUpdate => {
   const isImage = getRandomBoolean(0.6);
   const statusColors = ['bg-purple-500', 'bg-teal-500', 'bg-blue-500', 'bg-red-500'];
   
   return {
       id: `st_new_${Date.now()}`,
       type: isImage ? 'image' : 'text',
       content: isImage 
          ? `https://picsum.photos/seed/new_${Date.now()}/500/800` 
          : getRandomItem(["Work hard!", "Happy day", "Bismillah", "Otw...", "Traffic 😫"]),
       timestamp: 'Baru saja',
       isViewed: false,
       color: !isImage ? getRandomItem(statusColors) : undefined
   };
};

export const generateProfileChange = (user: User): Partial<User> => {
    // 50% chance name change, 50% about change
    if (getRandomBoolean(0.5)) {
        // Add or remove emoji/suffix
        const currentName = user.name;
        const suffixes = [' 💼', ' 🏠', ' (Work)', ' 😊', ''];
        // Strip existing suffix if simple approach
        const baseName = currentName.replace(/ [\p{Emoji}\u203C-\u3299]\s?.*$/gu, '').replace(/ \(.*\)$/, '');
        return { name: baseName + getRandomItem(suffixes) };
    } else {
        const newAbouts = ['Available', 'Busy', 'At the gym', 'Sleeping', 'Urgent calls only', 'Battery about to die'];
        return { about: getRandomItem(newAbouts) };
    }
};
