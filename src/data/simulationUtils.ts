
import { ChatSession, Message, StatusUpdate, User } from '../types';
import { GREETINGS, QUESTIONS, STATEMENTS, BUSINESS_TALK } from './seeds/conversations';
import { getRandomItem, getRandomInt, generateTimestamp, getRandomBoolean } from './utils/helpers';
import { ROMANTIC_SCRIPT } from './seeds/romance';

export const generateAIResponse = (userMessage: string, isSpecialChat: boolean, isSecretChat: boolean): string => {
  const message = userMessage.toLowerCase();
  const now = new Date();
  const hour = now.getHours();
  
  const getTimeGreeting = (): string => {
    if (hour >= 5 && hour < 11) {
      return ['Selamat pagi! ☀️', 'Morning! 🌅', 'Selamat pagi sayang 🥰', 'Good morning! ✨'][Math.floor(Math.random() * 4)];
    } else if (hour >= 11 && hour < 15) {
      return ['Siang ini productive ya! 💪', 'Lunch time soon? 🍽️', 'Siang yang panas! ☀️', 'Stay hydrated ya! 💧'][Math.floor(Math.random() * 4)];
    } else if (hour >= 15 && hour < 18) {
      return ['Sore yang indah! 🌇', 'Almost evening 😌', 'Good afternoon! 🍵', 'Semangat sore! 💪'][Math.floor(Math.random() * 4)];
    } else if (hour >= 18 && hour < 21) {
      return ['Selamat malam! 🌙', 'Evening time! ✨', 'Dinner belum? 🍝', 'Relax time 😌'][Math.floor(Math.random() * 4)];
    } else {
      return ['Malem malam masih stay awake? 🌃', 'Sleepy tapi masih chat ya? 😴', 'Late night vibes 🌌', 'Jangan kelamaan jaga ya! 😴'][Math.floor(Math.random() * 4)];
    }
  };
  
  const isAIAvailable = hour >= 6 && hour <= 23;
  
  if (isSpecialChat) {
    const romanticResponses = [
      "Awww, kamu gemesin 💕", "Miss you too sayangg 🥺", "Jangan lupa makan ya ❤️", 
      "Semangat kerjanyaa! 💪", "Aku pride sama kamu 😘", "Gabisa fokus kerja karena mikir kamu 😳",
      "Ketemu weekend ini ya? 🥰", "Love you 3000! 💖", "Jangan lupa istirahat yaa ❤️",
      "Aku selalu support kamu! 🌟", "Thank youuu love you ❤️❤️", "Kamu terbaik 💕",
      "Hati-hati di jalan yaa 🚗", "Prayer for you my love 🙏", "Cantik/paket ganteng kamu hari ini 😍"
    ];
    if (Math.random() <= 0.3) {
      romanticResponses.unshift(getTimeGreeting());
    }
    return romanticResponses[Math.floor(Math.random() * romanticResponses.length)];
  }
  
  if (isSecretChat) {
    const secretResponses = [
      "Shh... jangan di browser history 😏", "Risky tapi worth it 😂", "Kapan next meet? 🥵",
      "Gabisa lupa meeting kita yesterday 😂", "I miss your touch 💕", "Chat ini harus dihapus ya 🔐",
      "Cantik poll hari ini 😍", "Miss uuu 😘", "Besok free?", "Jangan lupa clear chat 🔒"
    ];
    return secretResponses[Math.floor(Math.random() * secretResponses.length)];
  }
  
  if (!isAIAvailable) {
    const nightResponses = [
      "Wkwk masih pada aktif ya 😂", "Gabut ya malam-malam? 😆", "Semangat gabutnya! 💪",
      "Ada apa diterus malam gini? 😅", "Wkwk pada tidur dong! 😴", "Gabisa tidur ya? 😂",
      "Gasclean yaa, tidur sana! 😴", "Bener-bener gabut nih 😂"
    ];
    return nightResponses[Math.floor(Math.random() * nightResponses.length)];
  }
  
  if (message.includes('halo') || message.includes('hi') || message.includes('hey') || message.includes('hai')) {
    return getTimeGreeting();
  }
  
  if (message.includes('apa') || message.includes(' gimana') || message.includes(' bagaimana')) {
    const questionResponses = [
      "Oke oke semuanya baik! 😊", "Fine fine aja, kamu?", "Biasalah yaa... kerja terus 😅",
      "Lagi busy nih, tapi baik2 aja 💪", "Alhamdullillah baik 😇", "Lagi baik2 saja, kamu gimana?"
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }
  
  if (message.includes(' baik') || message.includes('ok') || message.includes('siap') || message.includes('sure') || message.includes('oke')) {
    const okResponses = [
      "Oke oke! 👍", "Siapp! 🙌", "Baguss 👍👍", "Okeee 💯", "Siap boss! 😎"
    ];
    return okResponses[Math.floor(Math.random() * okResponses.length)];
  }
  
  if (message.includes('tidak') || message.includes('enggak') || message.includes('ga') || message.includes('gak')) {
    const noResponses = [
      "Yaudah gapapa 😊", "Okeee nggak apa2 🙏", "Gapapalah, yang penting usaha 💪", "Yahh 😅", "Yaudah santai aja! 😌"
    ];
    return noResponses[Math.floor(Math.random() * noResponses.length)];
  }
  
  if (message.includes('terima') || message.includes('thank') || message.includes('thx') || message.includes('makasih')) {
    const thanksResponses = [
      "Sama-sama! 💕", "You're welcome! 😊", "Tidak perlu berterima kasih, kita kan dekat 😘",
      "Sangat welcome! 🙌", "Sama-samaa, love you! ❤️"
    ];
    return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
  }
  
  if (message.includes('siang') || message.includes('sore') || message.includes('pagi') || message.includes('malam')) {
    return getTimeGreeting();
  }
  
  const defaultResponses = [
    "Oke oke 👍", "Hmm interesting 🤔", "Yaelah haha 😂", "Wkwk bener 😂", 
    "Serius? 😅", "Gila lu haha 😆", "Betul betull 👍", "Kita ketemu kapan yok? ☕",
    "Boleh juga nih 😂", "Gimana gitu? 🙃", "Lah bener juga 😂", "Okelah kalau gitu 💯",
    "Hah apa? 😳", "Wkwk 😂", "Iyaaa! 😊", "Oke deh 👍", "Asyiapp! 🙌"
  ];
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const getRandomMessageText = (isSpecialUser: boolean): string => {
  if (isSpecialUser) {
    const romanticTexts = [
      "Kangen deh 🥺", "Lagi apa sayang?", "Jangan lupa makan ya ❤️", 
      "Nanti video call yuk?", "Sticker: ❤️", "I love you 3000",
      "Pap dongg", "Hati-hati di jalan yaa", "Semangat kerjanya sayang!"
    ];
    return getRandomItem(romanticTexts);
  }
  
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
    isMine: false,
    status: 'read',
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
    if (getRandomBoolean(0.5)) {
        const currentName = user.name;
        const suffixes = [' 💼', ' 🏠', ' (Work)', ' 😊', ''];
        const baseName = currentName.replace(/ [\p{Emoji}\u203C-\u3299]\s?.*$/gu, '').replace(/ \(.*\)$/, '');
        return { name: baseName + getRandomItem(suffixes) };
    } else {
        const newAbouts = ['Available', 'Busy', 'At the gym', 'Sleeping', 'Urgent calls only', 'Battery about to die'];
        return { about: getRandomItem(newAbouts) };
    }
};
