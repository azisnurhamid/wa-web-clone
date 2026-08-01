import React from 'react';
import { Smile, Paperclip, Mic, Send, FileText, Image as ImageIcon, Camera, User, BarChart2, Sticker } from 'lucide-react';
import { useConfig } from '../../config/config';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isInteractionLocked: boolean;
  showAttachMenu: boolean;
  setShowAttachMenu: (show: boolean) => void;
  attachMenuRef: React.RefObject<HTMLDivElement>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  isInteractionLocked,
  showAttachMenu,
  setShowAttachMenu,
  attachMenuRef,
  handleKeyPress,
  handleSend
}) => {
  const { TEXTS } = useConfig();
  return (
    <div className="min-h-[62px] bg-[#f0f2f5] px-2 md:px-4 py-2 flex items-center gap-2 md:gap-4 z-10 border-t border-gray-200 relative">
      <div className="flex gap-2 md:gap-4 text-[#54656f] items-center">
        <button title={TEXTS.chatWindow.emoji} className="hidden md:block" disabled={isInteractionLocked}>
          <Smile size={26} strokeWidth={1.5} className="hover:text-gray-600" />
        </button>
        <button title={TEXTS.chatWindow.emoji} className="block md:hidden" disabled={isInteractionLocked}>
          <Smile size={24} strokeWidth={1.5} className="hover:text-gray-600" />
        </button>

        <div className="relative" ref={attachMenuRef}>
          <button 
            title={TEXTS.chatWindow.attach} 
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`transition-transform duration-200 ${showAttachMenu ? 'rotate-45 text-[#008069]' : 'rotate-0'}`}
            disabled={isInteractionLocked}
          >
            <Paperclip size={24} strokeWidth={1.5} />
          </button>
          
          <div className={`absolute bottom-12 left-0 md:left-[-10px] flex flex-col gap-4 transition-all duration-200 ${showAttachMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-75 invisible'}`}>
            <AttachItem color="bg-[#5157ae]" icon={<FileText size={20} fill="white" />} label={TEXTS.chatWindow.attachments.document} />
            <AttachItem color="bg-[#007bfc]" icon={<ImageIcon size={20} fill="white" />} label={TEXTS.chatWindow.attachments.photoVideo} />
            <AttachItem color="bg-[#d3396d]" icon={<Camera size={20} />} label={TEXTS.chatWindow.attachments.camera} />
            <AttachItem color="bg-[#0063cb]" icon={<User size={20} fill="white" />} label={TEXTS.chatWindow.attachments.contact} />
            <AttachItem color="bg-[#ffbc38]" icon={<BarChart2 size={20} />} label={TEXTS.chatWindow.attachments.poll} />
            <AttachItem color="bg-[#0063cb]" icon={<Sticker size={20} fill="white" />} label={TEXTS.chatWindow.attachments.newSticker} />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <input
          id="message-input"
          name="message"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={TEXTS.chatWindow.typeMessage}
          className="w-full py-[9px] px-4 bg-white rounded-lg text-sm text-[#111b21] placeholder:text-[#667781] focus:outline-none"
          disabled={isInteractionLocked}
          autoComplete="off"
        />
      </div>

      <div className="text-[#54656f]">
        {inputText.trim() ? (
          <button onClick={handleSend} className="text-[#00a884]" disabled={isInteractionLocked}>
            <Send size={24} />
          </button>
        ) : (
          <button title={TEXTS.chatWindow.voiceRecord} disabled={isInteractionLocked}>
            <Mic size={24} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};

const AttachItem = ({ color, icon, label }: { color: string, icon: React.ReactNode, label: string }) => (
  <div className="group relative flex items-center cursor-pointer">
    <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${color}`}>
      {icon}
    </div>
    <div className="absolute left-16 bg-white/80 px-2 py-1 rounded text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm z-50">
      {label}
    </div>
  </div>
);
