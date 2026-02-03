
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, StatusUpdate } from '../types';

interface StatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allContacts: User[];
  isPrivacyMode: boolean; // Add Privacy Mode Prop
  isInteractionLocked: boolean; // Add Lock Prop
}

const StatusDrawer: React.FC<StatusDrawerProps> = ({ isOpen, onClose, allContacts, isPrivacyMode, isInteractionLocked }) => {
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);

  // Filter contacts who have status updates
  const usersWithStatus = allContacts.filter(u => u.statusUpdates && u.statusUpdates.length > 0);

  // Separate recent (unviewed) vs viewed (viewed)
  // Logic: If ANY status is unviewed, put user in "Recent". If ALL viewed, "Viewed".
  const recentUpdates = usersWithStatus.filter(u => u.statusUpdates?.some(s => !s.isViewed));
  const viewedUpdates = usersWithStatus.filter(u => u.statusUpdates?.every(s => s.isViewed));

  // Auto advance status logic
  useEffect(() => {
      let timer: number;
      if (viewingUser && viewingUser.statusUpdates) {
          timer = window.setTimeout(() => {
              if (activeStatusIndex < viewingUser.statusUpdates!.length - 1) {
                  setActiveStatusIndex(prev => prev + 1);
              } else {
                  setViewingUser(null); // Close viewer
                  setActiveStatusIndex(0);
              }
          }, 3500); // 3.5 seconds per story
      }
      return () => clearTimeout(timer);
  }, [viewingUser, activeStatusIndex]);

  if (!isOpen && !viewingUser) return null;

  const handleOpenStatus = (user: User) => {
      if (isPrivacyMode) return; // Disable opening status in privacy mode
      setViewingUser(user);
      // Find first unviewed status index to start there
      const firstUnviewed = user.statusUpdates?.findIndex(s => !s.isViewed);
      setActiveStatusIndex(firstUnviewed !== undefined && firstUnviewed !== -1 ? firstUnviewed : 0);
  };

  const handleCreateStatus = () => {
      if (isPrivacyMode) return;
      alert("Fitur tambah status baru");
  };

  const currentStatus = viewingUser?.statusUpdates?.[activeStatusIndex];
  
  // Helper for blur logic
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <>
    <div 
      className={`absolute inset-0 bg-[#f0f2f5] z-20 flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
        {/* Header */}
      <div className="h-[108px] bg-[#008069] flex items-end px-6 pb-4">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[19px] font-medium">Status</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* My Status - Create Action */}
          <div 
            onClick={handleCreateStatus}
            className={`flex items-center gap-4 px-4 py-8 bg-white shadow-sm mb-3 transition-colors duration-200
                ${isPrivacyMode 
                    ? 'cursor-not-allowed opacity-70' 
                    : 'cursor-pointer hover:bg-[#f5f6f6]'
                }
            `}
          >
              <div className={`relative transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}>
                  <img 
                      src="https://picsum.photos/id/64/200/200" 
                      alt="My Status" 
                      className="w-10 h-10 rounded-full object-cover opacity-80"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#00a884] rounded-full border-2 border-white p-0.5 text-white">
                      <Plus size={10} strokeWidth={4} />
                  </div>
              </div>
              <div>
                  <h3 className={`text-[17px] text-[#111b21] font-normal transition-all duration-300 ${blurClass}`}>Status Saya</h3>
                  <p className={`text-[14px] text-[#667781] transition-all duration-300 ${blurClass}`}>Klik untuk menambahkan pembaruan status</p>
              </div>
          </div>

          {/* RECENT UPDATES */}
          {recentUpdates.length > 0 && (
             <div className="px-4 py-3 text-[#008069] text-[14px] font-medium">TERBARU</div>
          )}
          
          {recentUpdates.map(user => (
              <StatusItem key={user.id} user={user} onClick={() => handleOpenStatus(user)} isPrivacyMode={isPrivacyMode} isInteractionLocked={isInteractionLocked} />
          ))}

          {/* VIEWED UPDATES */}
          {viewedUpdates.length > 0 && (
            <div className="px-4 py-3 text-[#008069] text-[14px] font-medium mt-4">DILIHAT</div>
          )}

          {viewedUpdates.map(user => (
              <StatusItem key={user.id} user={user} onClick={() => handleOpenStatus(user)} isViewedSection isPrivacyMode={isPrivacyMode} isInteractionLocked={isInteractionLocked} />
          ))}

          {usersWithStatus.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                  Tidak ada pembaruan status dari kontak Anda.
              </div>
          )}
      </div>
    </div>

    {/* Full Screen Status Viewer */}
    {viewingUser && currentStatus && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
            {/* Progress Bars */}
            <div className="absolute top-4 left-0 right-0 px-2 flex gap-1 z-50 max-w-[600px] mx-auto w-full">
                {viewingUser.statusUpdates?.map((_, idx) => (
                    <div key={idx} className="h-0.5 bg-white/30 flex-1 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-white transition-all duration-300 ${
                                idx < activeStatusIndex ? 'w-full' : 
                                idx === activeStatusIndex ? 'animate-[progress_3.5s_linear_forwards] w-full origin-left' : 'w-0'
                            }`}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="absolute top-6 left-0 right-0 px-4 flex justify-between items-center z-50 max-w-[600px] mx-auto w-full">
                 <div className="flex items-center gap-3">
                     <button onClick={() => setViewingUser(null)} className="text-white">
                        <ArrowLeft size={24} />
                     </button>
                     <img src={viewingUser.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                     <div className="flex flex-col text-white">
                         <span className="font-medium text-sm">{viewingUser.name}</span>
                         <span className="text-xs opacity-70">{currentStatus.timestamp}</span>
                     </div>
                 </div>
                 <button onClick={() => setViewingUser(null)} className="text-white">
                     <X size={24} />
                 </button>
            </div>

            {/* Navigation Buttons (Desktop) */}
            <button 
                className="absolute left-4 top-1/2 text-white/50 hover:text-white p-2 rounded-full hidden md:block"
                onClick={(e) => {
                    e.stopPropagation();
                    if(activeStatusIndex > 0) setActiveStatusIndex(prev => prev - 1);
                }}
            >
                <ChevronLeft size={40} />
            </button>
            <button 
                className="absolute right-4 top-1/2 text-white/50 hover:text-white p-2 rounded-full hidden md:block"
                onClick={(e) => {
                    e.stopPropagation();
                    if(viewingUser.statusUpdates && activeStatusIndex < viewingUser.statusUpdates.length - 1) setActiveStatusIndex(prev => prev + 1);
                }}
            >
                <ChevronRight size={40} />
            </button>

            {/* Content Content */}
            <div className="h-full w-full flex items-center justify-center bg-black/90">
                {currentStatus.type === 'image' ? (
                     <div className="relative max-w-[500px] w-full flex flex-col items-center">
                        <img 
                            key={currentStatus.id} // Key forces re-render for animation
                            src={currentStatus.content} 
                            alt="Status" 
                            className="max-h-[80vh] w-full object-contain"
                        />
                        {currentStatus.caption && (
                             <div className="bg-black/40 backdrop-blur-sm p-4 w-full text-center text-white mt-4 rounded-lg">
                                 {currentStatus.caption}
                             </div>
                        )}
                     </div>
                ) : (
                    <div 
                        className={`w-full max-w-[500px] aspect-[9/16] md:aspect-auto md:h-[80vh] flex items-center justify-center p-10 text-center ${currentStatus.color || 'bg-purple-600'}`}
                    >
                        <p className="text-white text-3xl font-medium leading-relaxed">
                            {currentStatus.content}
                        </p>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    )}
    </>
  );
};

// Component for Status Item in Drawer List
const StatusItem = ({ user, onClick, isViewedSection = false, isPrivacyMode, isInteractionLocked }: { user: User, onClick: () => void, isViewedSection?: boolean, isPrivacyMode: boolean, isInteractionLocked: boolean }) => {
    const lastUpdate = user.statusUpdates?.[user.statusUpdates.length - 1];
    
    // Ring Logic for List Item
    const strokeColor = isViewedSection ? '#d1d7db' : '#00a884';

    // Helper for blur logic
    const blurClass = isPrivacyMode 
      ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
      : '';

    return (
        <div 
          onClick={onClick}
          className={`bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-100 hover:bg-[#f5f6f6] ${isPrivacyMode ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
            <div className={`relative w-[48px] h-[48px] flex items-center justify-center transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}>
               <svg viewBox="0 0 52 52" className="absolute w-[52px] h-[52px] -rotate-90">
                    <circle cx="26" cy="26" r="24" fill="none" stroke={strokeColor} strokeWidth="2.5" />
               </svg>
               <img src={user.avatar} alt="Status" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`text-[17px] text-[#111b21] font-medium transition-all duration-300 ${blurClass}`}>{user.name}</h3>
                <p className={`text-[14px] text-[#667781] transition-all duration-300 ${blurClass}`}>{lastUpdate?.timestamp}</p>
            </div>
        </div>
    );
};

export default StatusDrawer;
