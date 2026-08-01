import { ChatSession, User, Message } from '../types';
import { getRandomInt, generateTimestamp, getSortableTimestamp, getRandomItem } from '../utils/helpers';

export const generateMockData = (botReplies: any, contacts: any, scenarios: any, URLS: any) => {
    const generateAIConversation = (user: User, isRomantic: boolean = false): ChatSession => {
        const now = Date.now();
        const messageCount = getRandomInt(5, 15);
        const messages: Message[] = [];
        
        const romanticPrefixes = botReplies.romanticPrefixes;
        const casualPrefixes = botReplies.casualPrefixes;
        const topics = botReplies.topics;
        
        for (let i = 0; i < messageCount; i++) {
            const isMine = getRandomInt(1, 100) <= 50;
            const prefix = isRomantic 
                ? getRandomItem(romanticPrefixes)
                : getRandomItem(casualPrefixes);
            const topic = getRandomItem(topics);
            
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
                text: getRandomItem(texts),
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
            pinned: false,
            isTyping: false
        };
    };

    const generateSecretConversation = (): ChatSession => {
        const now = Date.now();
        const secretNames = contacts.secretNames;
        const secretMessages = botReplies.responses.secret;
        
        const user: User = {
            id: `secret_${now}`,
            name: getRandomItem(secretNames),
            avatar: `${URLS.avatars.seed}${now}/200/200`,
            isOnline: getRandomInt(1, 100) <= 60,
            about: getRandomInt(1, 100) <= 50 ? 'Online' : 'Terakhir dilihat baru saja',
            phoneNumber: 'Nomor tidak dikenal',
            statusUpdates: []
        };
        
        const messageCount = getRandomInt(3, 8);
        const messages: Message[] = [];
        
        for (let i = 0; i < messageCount; i++) {
            const isMine = getRandomInt(1, 100) <= 40;
            messages.push({
                id: `msg_secret_${i}_${now}`,
                text: getRandomItem(secretMessages),
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
            pinned: false,
            isTyping: false
        };
    };


    const TOTAL_GROUPS = 20;
    const TOTAL_ARCHIVED = 90;
    const TOTAL_ACTIVE_CHATS = 40;

    let allSessions: ChatSession[] = [];

    allSessions.push(generateSecretConversation());
    
    for (let i = 0; i < TOTAL_GROUPS; i++) {
        const groupName = getRandomItem(contacts.groupNames) + ` ${i + 1}`;
        
        const groupUser: User = {
            id: `group_${i}_${Date.now()}`,
            name: groupName,
            avatar: `${URLS.avatars.seed}group${i}/200/200`,
            isOnline: false,
            about: `${getRandomInt(5, 50)} peserta`,
            statusUpdates: [],
            phoneNumber: ''
        };
        
        const isArchived = getRandomInt(1, 100) <= 10;
        allSessions.push(generateAIConversation(groupUser, false));
        if (!isArchived) {
            allSessions[allSessions.length - 1].archived = false;
        }
    }
    
    for (let i = 0; i < TOTAL_ACTIVE_CHATS; i++) {
        const names = contacts.contact.names;
        const name = getRandomItem(names);
        const contact: User = {
            id: `contact_${i}_${Date.now()}`,
            name: name as string,
            avatar: `${URLS.avatars.seed}contact${i}/200/200`,
            isOnline: getRandomInt(1, 100) <= 30,
            about: getRandomItem(contacts.contact.abouts),
            statusUpdates: [],
            phoneNumber: '+62800000000'
        };
        
        const chat = generateAIConversation(contact, getRandomInt(1, 100) <= 20);
        chat.archived = false;
        allSessions.push(chat);
    }
    
    for (let i = 0; i < TOTAL_ARCHIVED; i++) {
        const names = contacts.contact.names;
        const name = getRandomItem(names);
        const contact: User = {
            id: `archived_${i}_${Date.now()}`,
            name: name as string,
            avatar: `${URLS.avatars.seed}archived${i}/200/200`,
            isOnline: false,
            about: 'Archived',
            phoneNumber: '+62800000000',
            statusUpdates: []
        };
        const chat = generateAIConversation(contact, false);
        chat.archived = true;
        allSessions.push(chat);
    }

    const secretUser: User = {
        id: 'secret_1',
        name: '???',
        avatar: URLS.avatars.id177,
        isOnline: true,
        about: 'Online',
        phoneNumber: 'Tidak dikenal',
        statusUpdates: []
    };

    const secretMessages: Message[] = scenarios.predefinedSecret.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp || generateTimestamp(getRandomInt(0, 5)),
        status: msg.status as "read" | "sent" | "delivered"
    }));

    const secretSession: ChatSession = {
        id: 'chat_secret_1',
        user: secretUser,
        lastMessage: secretMessages[secretMessages.length - 1].text,
        lastMessageTime: secretMessages[secretMessages.length - 1].timestamp,
        lastMessageTimestamp: getSortableTimestamp(0.5),
        unreadCount: 1,
        messages: secretMessages,
        archived: false,
        pinned: false,
        isTyping: false
    };
    allSessions.push(secretSession);

    if (allSessions.length > 1) {
        allSessions[1].pinned = true;
    }

    return { CHAT_SESSIONS: allSessions, ALL_CONTACTS: allSessions.map(s => s.user) };
};
