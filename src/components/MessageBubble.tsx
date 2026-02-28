
import React from 'react';
import { Message } from '../types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isPrivacyMode?: boolean;
  isInteractionLocked?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isPrivacyMode = false, isInteractionLocked = false }) => {
  const isMine = message.isMine;

  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div className={`flex w-full mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[65%] px-3 py-2 text-sm shadow-sm transition-all duration-300
          ${isMine 
            ? 'bg-[#d9fdd3] rounded-bl-lg rounded-br-lg rounded-tl-lg rounded-tr-none' 
            : 'bg-white rounded-bl-lg rounded-br-lg rounded-tr-lg rounded-tl-none'
          }
          ${blurClass}
        `}
      >
        <span className="text-gray-900 leading-relaxed block pr-7 break-words">
          {message.text}
        </span>
        
        <div className="flex justify-end items-center gap-1 mt-[-4px] min-w-[50px] float-right">
            <span className="text-[10px] text-gray-500">
                {message.timestamp}
            </span>
            {isMine && (
                <span className={`text-[14px] ${message.status === 'read' ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                    <CheckCheck size={14} strokeWidth={2} />
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
