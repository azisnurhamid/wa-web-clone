
import { ChatSession, User, Message, StatusUpdate } from '../types';
import { generateContacts, generateUser } from './generators/userGenerator';
import { generateChatSession } from './generators/chatGenerator';
import { getRandomInt, generateTimestamp } from './utils/helpers';
import { ROMANTIC_SCRIPT } from './seeds/romance';

const TOTAL_CONTACTS = 900;
const TOTAL_GROUPS = 20;
const TOTAL_ARCHIVED = 90;
const TOTAL_ACTIVE_CHATS = 40;

const contactsPool = generateContacts(TOTAL_CONTACTS);

const groupsPool: User[] = [];
for (let i = 0; i < TOTAL_GROUPS; i++) {
    groupsPool.push(generateUser(`g_${i}`, true));
}

let allSessions: ChatSession[] = [];
const usedUserIds = new Set<string>();

const createSession = (pool: User[], isGroup: boolean, isArchived: boolean, count: number, startIdx = 0) => {
    for (let i = 0; i < count; i++) {
        const user = pool[startIdx + i];
        if (!user) break;
        
        const isPinned = !isArchived && getRandomInt(1, 100) <= 5; 
        allSessions.push(generateChatSession(user, isGroup, isArchived, isPinned));
        usedUserIds.add(user.id);
    }
};

const createSpecialUser = (): ChatSession => {
    const specialUser: User = {
        id: 'special_1',
        name: 'Dinda ❤️',
        avatar: 'https://picsum.photos/id/65/200/200',
        isOnline: true,
        about: 'Lucky to have you 🔒❤️',
        phoneNumber: '+62 812-3456-7890',
        statusUpdates: [
            {
                id: 'st_special_1',
                type: 'image',
                content: 'https://picsum.photos/id/342/500/800',
                caption: 'Missing you... 🥺',
                timestamp: generateTimestamp(15),
                isViewed: false
            }
        ]
    };

    const specialMessages: Message[] = ROMANTIC_SCRIPT.map((script, index) => {
        return {
            id: `msg_special_${index}`,
            text: script.text,
            isMine: script.isMine,
            timestamp: generateTimestamp(script.offset),
            status: script.isMine ? 'read' : 'read' 
        };
    });

    return {
        id: 'chat_special_1',
        user: specialUser,
        lastMessage: specialMessages[specialMessages.length - 1].text,
        lastMessageTime: specialMessages[specialMessages.length - 1].timestamp,
        unreadCount: 2,
        messages: specialMessages,
        pinned: true,
        archived: false
    };
};

const specialSession = createSpecialUser();
allSessions.push(specialSession);

createSession(groupsPool, true, true, 5, 0);
createSession(groupsPool, true, false, 15, 5);

createSession(contactsPool, false, true, TOTAL_ARCHIVED - 5, 0); 
createSession(contactsPool, false, false, TOTAL_ACTIVE_CHATS, TOTAL_ARCHIVED - 5);

export const CHAT_SESSIONS = allSessions; 
export const ALL_CONTACTS = [specialSession.user, ...contactsPool, ...groupsPool]; 

console.log(`Generated ${ALL_CONTACTS.length} contacts and ${CHAT_SESSIONS.length} chat sessions.`);
