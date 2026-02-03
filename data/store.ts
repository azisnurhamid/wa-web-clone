
import { ChatSession, User, Message, StatusUpdate } from '../types';
import { generateContacts, generateUser } from './generators/userGenerator';
import { generateChatSession } from './generators/chatGenerator';
import { getRandomInt, generateTimestamp } from './utils/helpers';
import { ROMANTIC_SCRIPT } from './seeds/romance';

// CONFIGURATION
const TOTAL_CONTACTS = 900;
const TOTAL_GROUPS = 20;
const TOTAL_ARCHIVED = 90;
const TOTAL_ACTIVE_CHATS = 40;

// 1. GENERATE USERS POOL
const contactsPool = generateContacts(TOTAL_CONTACTS);

// Generate group pseudo-users
const groupsPool: User[] = [];
for (let i = 0; i < TOTAL_GROUPS; i++) {
    groupsPool.push(generateUser(`g_${i}`, true));
}

// 2. DISTRIBUTE CHATS
let allSessions: ChatSession[] = [];
const usedUserIds = new Set<string>();

// Helper to create session
const createSession = (pool: User[], isGroup: boolean, isArchived: boolean, count: number, startIdx = 0) => {
    for (let i = 0; i < count; i++) {
        const user = pool[startIdx + i];
        if (!user) break;
        
        const isPinned = !isArchived && getRandomInt(1, 100) <= 5; 
        allSessions.push(generateChatSession(user, isGroup, isArchived, isPinned));
        usedUserIds.add(user.id);
    }
};

// --- START SPECIAL USER CREATION ---
const createSpecialUser = (): ChatSession => {
    // 1. Define User Profile
    const specialUser: User = {
        id: 'special_1',
        name: 'Dinda ❤️',
        avatar: 'https://picsum.photos/id/65/200/200', // Pretty girl avatar
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

    // 2. Map Script to Messages
    const specialMessages: Message[] = ROMANTIC_SCRIPT.map((script, index) => ({
        id: `msg_special_${index}`,
        text: script.text,
        isMine: script.isMine,
        timestamp: generateTimestamp(script.offset),
        status: script.isMine ? 'read' : 'read' 
    }));

    // 3. Create Session
    return {
        id: 'chat_special_1',
        user: specialUser,
        lastMessage: specialMessages[specialMessages.length - 1].text,
        lastMessageTime: specialMessages[specialMessages.length - 1].timestamp,
        unreadCount: 2, // Biar mencolok ada notif
        messages: specialMessages,
        pinned: true, // WAJIB PIN
        archived: false
    };
};

// Insert Special User First
const specialSession = createSpecialUser();
allSessions.push(specialSession);
// --- END SPECIAL USER CREATION ---

// A. Create Group Chats
createSession(groupsPool, true, true, 5, 0);
createSession(groupsPool, true, false, 15, 5);

// B. Create Personal Chats
createSession(contactsPool, false, true, TOTAL_ARCHIVED - 5, 0); 
createSession(contactsPool, false, false, TOTAL_ACTIVE_CHATS, TOTAL_ARCHIVED - 5);

// 3. EXPORT FINAL DATA
export const CHAT_SESSIONS = allSessions; 
export const ALL_CONTACTS = [specialSession.user, ...contactsPool, ...groupsPool]; 

console.log(`Generated ${ALL_CONTACTS.length} contacts and ${CHAT_SESSIONS.length} chat sessions.`);
