
import { ChatSession, User, Message } from '../types';
import { getRandomInt, generateTimestamp, getSortableTimestamp, getRandomItem } from './utils/helpers';
const generateAIConversation = (user: User, isRomantic: boolean = false): ChatSession => {
    const now = Date.now();
    const messageCount = getRandomInt(5, 15);
    const messages: Message[] = [];
    
    const romanticPrefixes = ['Sayang', 'Honey', 'Baby', 'Darling', 'Aku'];
    const casualPrefixes = ['Halo', 'Hi', 'Hey', 'Oke', 'Ya'];
    const topics = [
        'meeting', 'project', 'tugas', 'ujian', 'kuliah',
        'makan', 'nonton', 'jalan', 'cafe', 'belanja',
        'kerja', 'lembur', 'cuti', 'liburan', 'weekend'
    ];
    
    for (let i = 0; i < messageCount; i++) {
        const isMine = getRandomInt(1, 100) <= 50;
        const prefix = isRomantic 
            ? romanticPrefixes[getRandomInt(0, romanticPrefixes.length - 1)]
            : casualPrefixes[getRandomInt(0, casualPrefixes.length - 1)];
        const topic = topics[getRandomInt(0, topics.length - 1)];
        
        const texts = isMine 
            ? [
                `${prefix}, ${topic} bagaimana?`,
                `Oke ${prefix}, setuju`,
                `${prefix} hari ini ${topic} apa?`,
                `Bagus${isRomantic ? ' sayang' : ''}!`,
                `Jangan lupa ${topic} ya`,
                `Siap ${prefix}!`,
                `${prefix}, ${topic} sudah selesai`
              ]
            : [
                `Halo ${prefix}!`,
                `Oke ${prefix}, ${topic} dulu`,
                `${prefix}, kita perlu bicara tentang ${topic}`,
                isRomantic ? `Kangen🥺` : `Hi there!`,
                `${prefix}, ${topic} penting nih`,
                `Jangan lupa ${topic} ya`,
                `Btw ${prefix}, ${topic} bagaimana?`
              ];
        
        messages.push({
            id: `msg_${user.id}_${i}_${now}`,
            text: texts[getRandomInt(0, texts.length - 1)],
            timestamp: generateTimestamp(getRandomInt(1, 72)),
            isMine: isMine,
            status: getRandomInt(1, 100) <= 40 ? 'read' : (getRandomInt(1, 100) <= 50 ? 'delivered' : 'sent')
        });
    }
    
    return {
        id: `chat_${user.id}_${now}`,
        user: user,
        lastMessage: messages[messages.length - 1].text,
        lastMessageTime: messages[messages.length - 1].timestamp,
        lastMessageTimestamp: getSortableTimestamp(getRandomInt(0, 72)),
        unreadCount: getRandomInt(0, 5),
        messages: messages,
        archived: getRandomInt(1, 100) <= 3,
        pinned: false
    };
};

const generateRomanticConversation = (user: User): ChatSession => {
    const now = Date.now();
    const romanticMessages = [
        { text: 'Aku sayang kamu ❤️', isMine: false },
        { text: 'Aku juga sayang kamu 😊', isMine: true },
        { text: 'Kangen🥺', isMine: false },
        { text: 'Kita ketemu weekend ini ya?', isMine: true },
        { text: 'Pasti! Missing you already 😘', isMine: false },
        { text: "Aku can`t wait 🥰", isMine: true },
        { text: 'Love you so much 💕', isMine: false },
        { text: 'Love you more 💖', isMine: true },
    ];
    
    const messages: Message[] = romanticMessages.map((msg, i) => ({
        id: `msg_romantic_${i}_${now}`,
        text: msg.text,
        timestamp: generateTimestamp(getRandomInt(1, 24)),
        isMine: msg.isMine,
        status: 'read'
    }));
    
    return {
        id: `chat_romantic_${now}`,
        user: user,
        lastMessage: messages[messages.length - 1].text,
        lastMessageTime: messages[messages.length - 1].timestamp,
        lastMessageTimestamp: getSortableTimestamp(1),
        unreadCount: getRandomInt(0, 2),
        messages: messages,
        archived: false,
        pinned: true
    };
};

const generateSecretConversation = (): ChatSession => {
    const now = Date.now();
    const secretNames = ['???', '🌙', '⭐', 'Misteri', 'Anonim'];
    const secretMessages = [
        'Miss you 😘',
        'Ketemu nanti malam? 🥵',
        'Shh... jangan sampai ketahuan 😏',
        'Chat kita bahaya kalau ketahuan 😅',
        'I miss your touch 💕',
        'Cantik kamu hari ini 😍',
        'Jangan lupa hapus chat ini ya 🔐',
        'Kapan kita ketemu lagi? 🥺',
        'Secret meeting? 😜',
        'Ingat selalu deletes chat 🔒'
    ];
    
    const user: User = {
        id: `secret_${now}`,
        name: secretNames[getRandomInt(0, secretNames.length - 1)],
        avatar: `https://picsum.photos/seed/${now}/200/200`,
        isOnline: getRandomInt(1, 100) <= 60,
        about: getRandomInt(1, 100) <= 50 ? 'Online' : 'Terakhir dilihat baru saja',
        phoneNumber: 'Nomor tidak dikenal'
    };
    
    const messageCount = getRandomInt(3, 8);
    const messages: Message[] = [];
    
    for (let i = 0; i < messageCount; i++) {
        const isMine = getRandomInt(1, 100) <= 40;
        messages.push({
            id: `msg_secret_${i}_${now}`,
            text: secretMessages[getRandomInt(0, secretMessages.length - 1)],
            timestamp: generateTimestamp(getRandomInt(0, 12)),
            isMine: isMine,
            status: getRandomInt(1, 100) <= 50 ? 'delivered' : 'read'
        });
    }
    
    return {
        id: `chat_secret_${now}`,
        user: user,
        lastMessage: messages[messages.length - 1].text,
        lastMessageTime: messages[messages.length - 1].timestamp,
        lastMessageTimestamp: getSortableTimestamp(getRandomInt(0, 12)),
        unreadCount: getRandomInt(0, 3),
        messages: messages,
        archived: false,
        pinned: false
    };
};

const TOTAL_CONTACTS = 900;
const TOTAL_GROUPS = 20;
const TOTAL_ARCHIVED = 90;
const TOTAL_ACTIVE_CHATS = 40;

let allSessions: ChatSession[] = [];

const createSpecialUser = (): ChatSession => {
    const specialUser: User = {
        id: `special_${Date.now()}`,
        name: ['Dinda ❤️', 'Ayu 🌹', 'Sari 💕', 'Maya 😍', 'Lisa 🥰'][getRandomInt(0, 4)],
        avatar: `https://picsum.photos/seed/${Date.now()}/200/200`,
        isOnline: getRandomInt(1, 100) <= 70,
        about: ['Sedang Meeting', 'Typing...', 'Online', 'Last seen recently', 'Ready'][getRandomInt(0, 4)],
        phoneNumber: `+62 ${getRandomInt(812, 899)}-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
        statusUpdates: [
            {
                id: `st_special_${Date.now()}`,
                type: 'image' as const,
                content: `https://picsum.photos/seed/${Date.now()}/500/800`,
                caption: ['Missing you... 🥺', 'Hari yang indah 🌅', 'Cantik 😘', 'Happy 😊'][getRandomInt(0, 3)],
                timestamp: generateTimestamp(getRandomInt(1, 24)),
                isViewed: getRandomInt(1, 100) <= 50
            }
        ]
    };

    return generateRomanticConversation(specialUser);
};

const generateAllSessions = () => {
    allSessions.push(createSpecialUser());
    
    allSessions.push(generateSecretConversation());
    
    for (let i = 0; i < TOTAL_GROUPS; i++) {
        const groupName = [
            'Keluarga 👨‍👩‍👧‍👦', 'Tim Kerja 💼', 'Teman Kuliah 📚', 
            ' Squad 🔥', 'Meeting Project 📋', 'Admin 🏠'
        ][getRandomInt(0, 5)] + ` ${i + 1}`;
        
        const groupUser: User = {
            id: `group_${i}_${Date.now()}`,
            name: groupName,
            avatar: `https://picsum.photos/seed/group${i}/200/200`,
            isOnline: false,
            about: `${getRandomInt(5, 50)} peserta`,
            statusUpdates: []
        };
        
        const isArchived = getRandomInt(1, 100) <= 10;
        allSessions.push(generateAIConversation(groupUser, false));
        if (!isArchived) {
            allSessions[allSessions.length - 1].archived = false;
        }
    }
    
    for (let i = 0; i < TOTAL_ACTIVE_CHATS; i++) {
        const names = [
            'Budi', 'Ani', 'Joko', 'Siti', 'Rudi', 'Wati', 'Doni', 'Lina',
            'Fajar', 'Nisa', 'Rian', 'Dewi', 'Hadi', 'Yuni', 'Ari', 'Retno'
        ];
        const name = names[getRandomInt(0, names.length - 1)];
        const contact: User = {
            id: `contact_${i}_${Date.now()}`,
            name: `${name} ${String.fromCharCode(65 + getRandomInt(0, 25))}.`,
            avatar: `https://picsum.photos/seed/contact${i}/200/200`,
            isOnline: getRandomInt(1, 100) <= 30,
            about: [
                'Available', 'Busy', 'Sedang Meeting',
                'Bisa chat kalau urgent', 'Morning! ☀️'
            ][getRandomInt(0, 4)],
            statusUpdates: []
        };
        
        const chat = generateAIConversation(contact, getRandomInt(1, 100) <= 20);
        chat.archived = false;
        allSessions.push(chat);
    }
    
    for (let i = 0; i < TOTAL_ARCHIVED; i++) {
        const contact: User = {
            id: `archived_${i}_${Date.now()}`,
            name: `Kontak Arsip ${i + 1}`,
            avatar: `https://picsum.photos/seed/archived${i}/200/200`,
            isOnline: false,
            about: 'Archived'
        };
        const chat = generateAIConversation(contact, false);
        chat.archived = true;
        allSessions.push(chat);
    }
};

generateAllSessions();

const specialSession = createSpecialUser();
specialSession.pinned = true;
allSessions.push(specialSession);
const secretUser: User = {
    id: 'secret_1',
    name: '???',
    avatar: 'https://picsum.photos/id/177/200/200',
    isOnline: true,
    about: 'Online',
    phoneNumber: 'Tidak dikenal',
    statusUpdates: []
};

const secretMessages: Message[] = [
    { id: 'msg_secret_1', text: 'Halo sayang 😘', timestamp: generateTimestamp(2), isMine: false, status: 'read' },
    { id: 'msg_secret_2', text: 'Kangen 🥺', timestamp: generateTimestamp(1.5), isMine: false, status: 'read' },
    { id: 'msg_secret_3', text: 'Aku juga kangen', timestamp: generateTimestamp(1), isMine: true, status: 'read' },
    { id: 'msg_secret_4', text: 'Ketemu malam ini?', timestamp: generateTimestamp(0.5), isMine: false, status: 'delivered' },
];

const secretSession: ChatSession = {
    id: 'chat_secret_1',
    user: secretUser,
    lastMessage: secretMessages[secretMessages.length - 1].text,
    lastMessageTime: secretMessages[secretMessages.length - 1].timestamp,
    lastMessageTimestamp: getSortableTimestamp(0.5),
    unreadCount: 1,
    messages: secretMessages,
    archived: false,
    pinned: false
};
allSessions.push(secretSession);

if (allSessions.length > 1) {
    allSessions[1].pinned = true;
}

export const CHAT_SESSIONS = allSessions; 
export const ALL_CONTACTS = allSessions.map(s => s.user);

console.log(`Generated ${ALL_CONTACTS.length} contacts and ${CHAT_SESSIONS.length} chat sessions by AI.`);
