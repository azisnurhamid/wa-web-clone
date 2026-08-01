import React, { useEffect, useRef } from 'react';
import { ChatSession, Message, User } from '../types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange, generateAIResponse } from '../services/simulationUtils';
import { getRandomInt, getRandomItem, generateTimestamp } from '../utils/helpers';
import { TIMING } from '../config/config';

interface UseSimulationParams {
  chats: ChatSession[];
  contacts: User[];
  activeChatId: string | null;
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  setContacts: React.Dispatch<React.SetStateAction<User[]>>;
}

export function useSimulation({ chats, contacts, activeChatId, setChats, setContacts }: UseSimulationParams) {
  const chatsRef = useRef(chats);
  const contactsRef = useRef(contacts);

  useEffect(() => {
    chatsRef.current = chats;
    contactsRef.current = contacts;
  }, [chats, contacts]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const getIndonesiaHour = (): number => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      return (utcHour + 7) % 24;
    };

    const getBusyHourMultiplier = (): number => {
      const hour = getIndonesiaHour();
      if (hour >= 23 || hour < 6) return 3.0;
      if (hour >= 6 && hour < 9) return 1.5;
      if (hour >= 12 && hour < 13) return 1.5;
      if (hour >= 17 && hour < 20) return 1.5;
      return 1.0;
    };

    const runSimulation = () => {
      if (!isMounted) return;

      const currentChats = chatsRef.current;
      const currentContacts = contactsRef.current;

      if (activeChatId) {
        const activeChat = currentChats.find(c => c.id === activeChatId);
        if (activeChat) {
          setChats(currentChats.map(c =>
            c.id === activeChat.id ? { ...c, isTyping: true } : c
          ));

          const typingDuration = getRandomInt(1000, 2000);

          setTimeout(() => {
            if (!isMounted) return;

            let newMessage;

            if (activeChat.id === 'chat_secret_1') {
              const secretTexts = [
                'Miss you 😘',
                'Ketemu nanti malam? 🥵',
                'Gabisa lupa kamu昨天的 meeting 😂',
                'Shh... jangan sampai ketahuan 😏',
                'Kapan有空一起吃饭?',
                'I miss your touch 💕',
                'Chat kita bahaya kalau ketahuan 😅',
                'Cantik kamu hari ini 😍',
                'Besok mau cafe?',
                'Jangan lupa hapus chat ini ya 🔐'
              ];
              newMessage = {
                id: `msg_secret_${Date.now()}`,
                text: getRandomItem(secretTexts),
                timestamp: generateTimestamp(0),
                isMine: false,
                status: getRandomInt(1, 100) <= 50 ? 'delivered' : 'read'
              };
            } else {
              newMessage = createIncomingMessage();
            }

            const statusRoll = getRandomInt(1, 100);
            let messageStatus: 'sent' | 'delivered' | 'read' = 'sent';
            if (statusRoll <= 30) {
              messageStatus = 'sent';
            } else if (statusRoll <= 60) {
              messageStatus = 'delivered';
            } else {
              messageStatus = 'read';
            }
            newMessage.status = messageStatus;

            const updatedChat = {
              ...activeChat,
              messages: [...activeChat.messages, newMessage],
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.timestamp,
              unreadCount: 0,
              isTyping: false
            };

            setChats(currentChats.map(c => c.id === activeChat.id ? updatedChat : c));

            const busyMultiplier = getBusyHourMultiplier();
            const aiReplyDelay = Math.floor(getRandomInt(1500, 3500) * busyMultiplier);
            setTimeout(() => {
              if (!isMounted) return;
              const isSecretChat = activeChat.id === 'chat_secret_1' || activeChat.user.name === '???';
              const aiResponse = generateAIResponse(newMessage.text, isSecretChat);
              const aiMessage: Message = {
                id: `ai_auto_${Date.now()}`,
                text: aiResponse,
                timestamp: generateTimestamp(0),
                isMine: true,
                status: 'delivered'
              };
              setChats(prev => {
                const chat = prev.find(c => c.id === activeChat.id);
                if (!chat) return prev;
                const updatedChatWithAI = {
                  ...chat,
                  messages: [...chat.messages, aiMessage],
                  lastMessage: aiResponse,
                  lastMessageTime: aiMessage.timestamp
                };
                return prev.map(c => c.id === activeChat.id ? updatedChatWithAI : c);
              });
            }, aiReplyDelay);

            scheduleNext(true);
          }, typingDuration);

          return;
        }
      }

      const eventType = getRandomInt(1, 7);

      if (eventType <= 6) {
        const pinnedChats = currentChats.filter(c => c.pinned);
        const secretChat = currentChats.find(c => c.id === 'chat_secret_1');
        const isSecretEvent = secretChat && getRandomInt(1, 100) <= 25;

        let targetChat;

        if (isSecretEvent && secretChat) {
          targetChat = secretChat;
        } else if (pinnedChats.length > 0 && getRandomInt(1, 100) <= 60) {
          const pinnedIndex = getRandomInt(0, pinnedChats.length - 1);
          targetChat = pinnedChats[pinnedIndex];
        } else {
          const targetChatIndex = getRandomInt(0, Math.min(15, currentChats.length - 1));
          targetChat = currentChats[targetChatIndex];
        }

        if (targetChat) {
          setChats(currentChats.map(c =>
            c.id === targetChat.id ? { ...c, isTyping: true } : c
          ));

          const typingDuration = getRandomInt(1000, 2500);

          setTimeout(() => {
            let newMessage;

            if (targetChat.id === 'chat_secret_1') {
              const secretTexts = [
                'Miss you 😘',
                'Ketemu nanti malam? 🥵',
                'Gabisa lupa kamu昨天的 meeting 😂',
                'Shh... jangan sampai ketahuan 😏',
                'Kapan有空一起吃饭?',
                'I miss your touch 💕',
                'Chat kita bahaya kalau ketahuan 😅',
                'Cantik kamu hari ini 😍',
                'Besok mau cafe?',
                'Jangan lupa hapus chat ini ya 🔐'
              ];
              newMessage = {
                id: `msg_secret_${Date.now()}`,
                text: getRandomItem(secretTexts),
                timestamp: generateTimestamp(0),
                isMine: false,
                status: getRandomInt(1, 100) <= 50 ? 'delivered' : 'read'
              };
            } else {
              newMessage = createIncomingMessage();
            }

            const statusRoll = getRandomInt(1, 100);
            let messageStatus: 'sent' | 'delivered' | 'read' = 'sent';
            if (statusRoll <= 30) {
              messageStatus = 'sent';
            } else if (statusRoll <= 60) {
              messageStatus = 'delivered';
            } else {
              messageStatus = 'read';
            }
            newMessage.status = messageStatus;

            const unreadRoll = getRandomInt(1, 100);
            let newUnreadCount = targetChat.unreadCount;

            if (unreadRoll <= 40) {
              newUnreadCount = 0;
            } else if (unreadRoll <= 75) {
              newUnreadCount = targetChat.id === activeChatId ? 0 : targetChat.unreadCount + 1;
            } else {
              newMessage.status = 'sent';
              newUnreadCount = targetChat.id === activeChatId ? 0 : targetChat.unreadCount + 1;
            }

            const updatedChat = {
              ...targetChat,
              messages: [...targetChat.messages, newMessage],
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.timestamp,
              unreadCount: newUnreadCount,
              isTyping: false
            };

            setChats(currentChats.map(c => c.id === targetChat.id ? updatedChat : c));

            if (targetChat.id === activeChatId) {
              const busyMultiplier = getBusyHourMultiplier();
              const aiReplyDelay = Math.floor(getRandomInt(1500, 3500) * busyMultiplier);
              setTimeout(() => {
                if (!isMounted) return;
                const isSecretChat = targetChat.id === 'chat_secret_1' || targetChat.user.name === '???';
                const aiResponse = generateAIResponse(newMessage.text, isSecretChat);
                const aiMessage: Message = {
                  id: `ai_auto_${Date.now()}`,
                  text: aiResponse,
                  timestamp: generateTimestamp(0),
                  isMine: true,
                  status: 'delivered'
                };
                setChats(prev => {
                  const chat = prev.find(c => c.id === targetChat.id);
                  if (!chat) return prev;
                  const updatedChatWithAI = {
                    ...chat,
                    messages: [...chat.messages, aiMessage],
                    lastMessage: aiResponse,
                    lastMessageTime: aiMessage.timestamp
                  };
                  return prev.map(c => c.id === targetChat.id ? updatedChatWithAI : c);
                });
              }, aiReplyDelay);
            }
          }, typingDuration);
        }
      } else if (eventType <= 8) {
        const targetChat = getRandomItem(currentChats as readonly ChatSession[]);
        if (targetChat && targetChat.messages.length > 0) {
          const deliveredMessages = targetChat.messages.filter(
            m => !m.isMine && (m.status === 'delivered' || m.status === 'sent')
          );

          if (deliveredMessages.length > 0 && getRandomInt(1, 100) <= 40) {
            const msgToUpdate = getRandomItem(deliveredMessages);
            const updatedMessages = targetChat.messages.map(m =>
              m.id === msgToUpdate.id ? { ...m, status: 'read' as const } : m
            );

            setChats(currentChats.map(c =>
              c.id === targetChat.id ? { ...c, messages: updatedMessages } : c
            ));
            return;
          }
        }

        const targetContact = getRandomItem(currentContacts as readonly User[]);
        if (targetContact) {
          const newStatus = createNewStatusUpdate();
          const updatedContact = {
            ...targetContact,
            statusUpdates: targetContact.statusUpdates ? [...targetContact.statusUpdates, newStatus] : [newStatus]
          };

          setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
          setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
        }
      } else {
        const targetContact = getRandomItem(currentContacts as readonly User[]);
        if (targetContact) {
          const updates = generateProfileChange(targetContact);
          const updatedContact = { ...targetContact, ...updates };

          setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
          setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
        }
      }
    };

    const scheduleNext = (isQuick: boolean = false) => {
      const busyMultiplier = getBusyHourMultiplier();

      let baseDelay: number;
      if (isQuick) {
        baseDelay = getRandomInt(2000, 5000);
      } else {
        baseDelay = getRandomInt(TIMING.simulationMinInterval, TIMING.simulationMaxInterval);
      }

      const delay = Math.floor(baseDelay * busyMultiplier);

      timeoutId = setTimeout(() => {
        if (isMounted) {
          runSimulation();
          scheduleNext();
        }
      }, delay);
    };

    const initialTimeout = setTimeout(() => {
      if (isMounted) {
        runSimulation();
        scheduleNext();
      }
    }, TIMING.simulationInitialDelay);

    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
    };
  }, [activeChatId]);
}
