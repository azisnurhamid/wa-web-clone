
import { User, StatusUpdate } from '../../types';
import { FIRST_NAMES, LAST_NAMES, ABOUT_STATUSES, GROUP_NAMES } from '../seeds/profiles';
import { getRandomInt, getRandomItem, getRandomBoolean, generateTimestamp } from '../utils/helpers';

const STATUS_COLORS = ['bg-purple-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
const STATUS_TEXTS = [
    'Hari yang indah! 🌞', 'Work hard, play hard', 'Coffee time ☕', 
    'Ada rekomendasi film bagus?', 'Alhamdulillah for everything', 'Mood 😎',
    'Traffic jam... again 🚗', 'Weekend vibes', 'Focus on your goals'
];

const generateStatusUpdates = (userId: string, count: number): StatusUpdate[] => {
    const updates: StatusUpdate[] = [];
    for (let i = 0; i < count; i++) {
        const isImage = getRandomBoolean(0.7); // 70% chance image
        const minutesAgo = getRandomInt(5, 1400); // Status within last 24h
        
        updates.push({
            id: `st_${userId}_${i}`,
            type: isImage ? 'image' : 'text',
            content: isImage 
                ? `https://picsum.photos/seed/status_${userId}_${i}/500/800` 
                : getRandomItem(STATUS_TEXTS),
            caption: isImage && getRandomBoolean(0.4) ? getRandomItem(STATUS_TEXTS) : undefined,
            timestamp: generateTimestamp(minutesAgo),
            isViewed: i === 0 ? false : getRandomBoolean(0.5), // First one usually unviewed for demo
            color: !isImage ? getRandomItem(STATUS_COLORS) : undefined
        });
    }
    // Sort chronological: older first (so user watches in order)
    return updates.sort((a, b) => {
        // Simple sort hack for mock timestamps, real app would use Date objects
        return a.id.localeCompare(b.id); 
    });
};

const generatePhoneNumber = () => {
    // Format: +62 8xx-xxxx-xxxx
    return `+62 8${getRandomInt(10, 99)}-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`;
};

export const generateUser = (id: string, isGroup = false): User => {
  let name = '';
  let avatar = '';
  let statusUpdates: StatusUpdate[] = [];
  let phoneNumber: string | undefined = undefined;

  if (isGroup) {
    name = getRandomItem(GROUP_NAMES);
    avatar = `https://picsum.photos/seed/group_${id}/200/200`;
  } else {
    const first = getRandomItem(FIRST_NAMES);
    const last = getRandomItem(LAST_NAMES);
    name = `${first} ${last}`;
    avatar = `https://picsum.photos/seed/${id}/200/200`;
    phoneNumber = generatePhoneNumber();

    // 25% chance a user has active status updates
    if (getRandomBoolean(0.25)) {
        const statusCount = getRandomInt(1, 5);
        statusUpdates = generateStatusUpdates(id, statusCount);
    }
  }

  return {
    id,
    name,
    avatar,
    isOnline: !isGroup && getRandomBoolean(0.3),
    about: isGroup ? 'Grup WhatsApp' : getRandomItem(ABOUT_STATUSES),
    statusUpdates: statusUpdates.length > 0 ? statusUpdates : undefined,
    phoneNumber
  };
};

export const generateContacts = (count: number): User[] => {
  const contacts: User[] = [];
  for (let i = 0; i < count; i++) {
    contacts.push(generateUser(`u_${i}`));
  }
  return contacts;
};
