import { ChatSession, Message, StatusUpdate, User } from '../types';
import botReplies from '../data/json/bot-replies.json';
import contacts from '../data/json/contacts.json';
import { getRandomItem, getRandomInt, getRandomBoolean } from '../utils/helpers';

export const generateAIResponse = (userMessage: string, isSecretChat: boolean): string => {
  const message = userMessage.toLowerCase();
  const now = new Date();
  const hour = now.getHours();
  
  const getTimeGreeting = (): string => {
    if (hour >= 5 && hour < 11) {
      return getRandomItem(botReplies.greetings.morning);
    } else if (hour >= 11 && hour < 15) {
      return getRandomItem(botReplies.greetings.noon);
    } else if (hour >= 15 && hour < 18) {
      return getRandomItem(botReplies.greetings.afternoon);
    } else if (hour >= 18 && hour < 21) {
      return getRandomItem(botReplies.greetings.evening);
    } else {
      return getRandomItem(botReplies.greetings.night);
    }
  };
  
  const isAIAvailable = hour >= 6 && hour <= 23;
  

  
  if (isSecretChat) {
    return getRandomItem(botReplies.responses.secret);
  }
  
  if (!isAIAvailable) {
    return getRandomItem(botReplies.responses.night);
  }
  
  if (message.includes('halo') || message.includes('hi') || message.includes('hey') || message.includes('hai')) {
    return getTimeGreeting();
  }
  
  if (message.includes('apa') || message.includes(' gimana') || message.includes(' bagaimana')) {
    return getRandomItem(botReplies.responses.questions);
  }
  
  if (message.includes(' baik') || message.includes('ok') || message.includes('siap') || message.includes('sure') || message.includes('oke')) {
    return getRandomItem(botReplies.responses.ok);
  }
  
  if (message.includes('tidak') || message.includes('enggak') || message.includes('ga') || message.includes('gak')) {
    return getRandomItem(botReplies.responses.no);
  }
  
  if (message.includes('terima') || message.includes('thank') || message.includes('thx') || message.includes('makasih')) {
    return getRandomItem(botReplies.responses.thanks);
  }
  
  if (message.includes('siang') || message.includes('sore') || message.includes('pagi') || message.includes('malam')) {
    return getTimeGreeting();
  }
  
  return getRandomItem(botReplies.responses.default);
};

const getRandomMessageText = (): string => {
  
  const category = getRandomInt(1, 4);
  switch (category) {
    case 1: return getRandomItem(botReplies.conversations.greetings);
    case 2: return getRandomItem(botReplies.conversations.questions);
    case 3: return getRandomItem(botReplies.conversations.statements);
    case 4: return getRandomItem(botReplies.conversations.businessTalk);
    default: return "Oke";
  }
};

export const createIncomingMessage = (): Message => {
  return {
    id: `msg_auto_${Date.now()}`,
    text: getRandomMessageText(),
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
    isMine: false,
    status: 'read',
  };
};

export const createNewStatusUpdate = (): StatusUpdate => {
   const isImage = getRandomBoolean(0.6);
   const statusColors = contacts.status.colors;
   
   return {
       id: `st_new_${Date.now()}`,
       type: isImage ? 'image' : 'text',
       content: isImage 
          ? `https://picsum.photos/seed/new_${Date.now()}/500/800` 
          : getRandomItem(contacts.status.texts),
       timestamp: 'Baru saja',
       isViewed: false,
       color: !isImage ? getRandomItem(statusColors) : undefined
   };
};

export const generateProfileChange = (user: User): Partial<User> => {
    if (getRandomBoolean(0.5)) {
        const currentName = user.name;
        const suffixes = contacts.profile.suffixes;
        const baseName = currentName.replace(/ [\p{Emoji}\u203C-\u3299]\s?.*$/gu, '').replace(/ \(.*\)$/, '');
        return { name: baseName + getRandomItem(suffixes) };
    } else {
        const newAbouts = contacts.profile.abouts;
        return { about: getRandomItem(newAbouts) };
    }
};
