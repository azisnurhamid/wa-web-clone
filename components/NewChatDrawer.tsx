
import React, { useState } from 'react';
import { ArrowLeft, Search, Users, UserPlus } from 'lucide-react';
import { ChatSession } from '../types';

interface NewChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: ChatSession[]; // Reusing chat sessions as mock contacts
  isPrivacyMode: boolean; // Receive privacy state
  isInteractionLocked: boolean; // Receive lock state
}

const NewChatDrawer: React.FC<NewChatDrawerProps> = ({ isOpen, onClose, contacts, isPrivacyMode, isInteractionLocked }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c => {
    const term = searchTerm.toLowerCase();
    const nameMatch = c.user.name.toLowerCase().includes(term);
    
    let phoneMatch = false;
    if (c.user.phoneNumber) {
        // Basic substring match (handles "+62", space, etc if typed exactly)
        if (c.user.phoneNumber.toLowerCase().includes(term)) {
            phoneMatch = true;
        } 
        // Numeric only match (handles "0812" matching "+62 812")
        else {
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
  
  // Helper for blur logic
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div 
      className={`absolute inset-0 bg-[#f0f2f5] z-30 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-[108px] bg-[#008069] flex items-end px-6 pb-4 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[19px] font-medium leading-none mb-1">Chat baru</h2>
            {/* Granular Blur: Total Contact Count in Header */}
            <span className={`text-xs text-white/80 transition-all duration-300 ${blurClass}`}>
                {contacts.length} kontak
            </span>
          </div>
        </div>
      </div>

      {/* Search Contacts */}
       <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2 shrink-0 z-10 shadow-sm">
        <div className="flex-1 flex items-center bg-[#f0f2f5] rounded-lg px-4 py-1.5">
            <Search size={18} className="text-[#54656f] mr-4" />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau nomor"
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700"
            />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="py-2">
               <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#f5f6f6]">
                    <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                        <Users size={24} fill="currentColor" />
                    </div>
                    <div className="text-[17px] text-[#111b21] font-medium">Grup baru</div>
               </div>
               <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#f5f6f6]">
                    <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                         <UserPlus size={24} />
                    </div>
                    <div className="text-[17px] text-[#111b21] font-medium">Komunitas baru</div>
               </div>
          </div>

          <div className="px-8 py-4 text-[#008069] text-[16px] font-normal uppercase flex items-center">
             {/* Granular Blur: Section Title Count */}
            <span className={`transition-all duration-300 ${blurClass}`}>
                {filteredContacts.length} Kontak di WhatsApp
            </span>
          </div>

          {filteredContacts.map(contact => (
              <div key={contact.id} className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-100">
                  {/* Granular Blur: Avatar */}
                  <img 
                    src={contact.user.avatar} 
                    alt={contact.user.name} 
                    className={`w-12 h-12 rounded-full object-cover transition-all duration-300 ${blurClass}`} 
                  />
                  <div className="flex-1 min-w-0">
                      {/* Granular Blur: Name */}
                      <div className={`text-[17px] text-[#111b21] font-normal truncate transition-all duration-300 ${blurClass}`}>
                          {contact.user.name}
                      </div>
                      {/* Granular Blur: About */}
                      <div className={`text-[14px] text-[#667781] truncate transition-all duration-300 ${blurClass}`}>
                          {contact.user.about || contact.user.phoneNumber || "Ada"}
                      </div>
                  </div>
              </div>
          ))}
          
          {filteredContacts.length === 0 && (
             <div className="p-8 text-center text-gray-500 text-sm">
                Tidak ada kontak ditemukan untuk "{searchTerm}"
             </div>
          )}
      </div>
    </div>
  );
};

export default NewChatDrawer;
