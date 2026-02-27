
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomItem = <T>(arr: readonly T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomBoolean = (probability = 0.5) => {
  return Math.random() < probability;
};

export const generateTimestamp = (minusMinutes: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minusMinutes);
  
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
                  
  const isYesterday = date.getDate() === today.getDate() - 1;

  if (isToday) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  } else if (isYesterday) {
    return 'Kemarin';
  } else {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
};
