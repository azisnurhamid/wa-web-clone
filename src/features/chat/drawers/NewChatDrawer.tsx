import React, { useState } from 'react';
import { ArrowLeft, Search, Users, UserPlus } from 'lucide-react';
import { ChatSession } from '@/types';
import { TEXTS } from '@/config/config';

interface NewChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: ChatSession[];
  isPrivacyMode: boolean;
  isInteractionLocked: boolean;
}

const NewChatDrawer: React.FC<NewChatDrawerProps> = ({
  isOpen,
  onClose,
  contacts,
  isPrivacyMode,
  isInteractionLocked,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = c.user.name.toLowerCase().includes(term);

    let phoneMatch = false;
    if (c.user.phoneNumber) {
      if (c.user.phoneNumber.toLowerCase().includes(term)) {
        phoneMatch = true;
      } else {
        const cleanTerm = term.replace(/\D/g, '');
        if (cleanTerm.length > 0) {
          const cleanPhone = c.user.phoneNumber.replace(/\D/g, '');
          if (cleanPhone.includes(cleanTerm)) {
            phoneMatch = true;
          }
        }
      }
    }

    return nameMatch || phoneMatch;
  });

  const blurClass = isPrivacyMode ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` : '';

  return (
    <div
      className={`absolute inset-0 bg-[#f0f2f5] z-30 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ top: '64px' }}
    >
      <div className="h-16 bg-[#008069] flex items-end px-6 pb-4 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[19px] font-medium leading-none mb-1">{TEXTS.newChat.title}</h2>
            <span className={`text-xs text-white/80 transition-all duration-300 ${blurClass}`}>
              {contacts.length} {TEXTS.newChat.contacts}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center justify-center shrink-0 z-10 shadow-sm">
        <div className="w-full max-w-md flex items-center bg-[#f0f2f5] rounded-lg px-4 py-1.5">
          <Search size={18} className="text-[#54656f] mr-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => !isInteractionLocked && setSearchTerm(e.target.value)}
            placeholder={
              isInteractionLocked ? TEXTS.sidebar.searchDisabled : TEXTS.newChat.searchPlaceholder
            }
            disabled={isInteractionLocked}
            className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700 ${isInteractionLocked ? 'cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        <div className="py-2">
          <div
            className={`flex items-center gap-4 px-4 py-3 ${isInteractionLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#f5f6f6]'}`}
          >
            <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white">
              <Users size={24} fill="currentColor" />
            </div>
            <div className="text-[17px] text-[#111b21] font-medium">{TEXTS.newChat.newGroup}</div>
          </div>
          <div
            className={`flex items-center gap-4 px-4 py-3 ${isInteractionLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#f5f6f6]'}`}
          >
            <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white">
              <UserPlus size={24} />
            </div>
            <div className="text-[17px] text-[#111b21] font-medium">
              {TEXTS.newChat.newCommunity}
            </div>
          </div>
        </div>

        <div className="px-8 py-4 text-[#008069] text-[16px] font-normal uppercase flex items-center">
          <span className={`transition-all duration-300 ${blurClass}`}>
            {filteredContacts.length} {TEXTS.newChat.contactsOnWhatsApp}
          </span>
        </div>

        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`flex items-center gap-4 px-4 py-3 border-b border-gray-100 relative group ${isInteractionLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#f5f6f6]'}`}
            onClick={() => (isInteractionLocked ? null : null)}
          >
            <div
              className={`relative transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
            >
              <img
                src={contact.user.avatar}
                alt={contact.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[17px] text-[#111b21] font-normal truncate transition-all duration-300 ${blurClass}`}
              >
                {contact.user.name}
              </div>
              <div
                className={`text-[14px] text-[#667781] truncate transition-all duration-300 ${blurClass}`}
              >
                {contact.user.about || contact.user.phoneNumber || 'Ada'}
              </div>
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            {TEXTS.newChat.noContactsFound} "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatDrawer;
