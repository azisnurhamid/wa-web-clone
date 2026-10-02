import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { TEXTS, APP_CONFIG } from '@/config/config';
import { STORAGE_KEYS } from '@/utils/constants';

const WhatsAppHelpButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [dragState, setDragState] = useState({
    hasInteracted: false,
    isDragging: false,
    left: 0,
    top: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ startX: 0, startY: 0, elemX: 0, elemY: 0, isDragging: false });

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const rect = containerRef.current!.getBoundingClientRect();

    setDragState((prev) => ({
      ...prev,
      hasInteracted: true,
      isDragging: false,
      left: rect.left,
      top: rect.top,
    }));

    const startX = e.clientX;
    const startY = e.clientY;
    const elemX = rect.left;
    const elemY = rect.top;

    dragInfo.current = { startX, startY, elemX, elemY, isDragging: false };

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (
        !dragInfo.current.isDragging &&
        (Math.abs(moveEvent.clientX - dragInfo.current.startX) > 3 ||
          Math.abs(moveEvent.clientY - dragInfo.current.startY) > 3)
      ) {
        dragInfo.current.isDragging = true;
      }

      if (dragInfo.current.isDragging) {
        setDragState((prev) => ({
          ...prev,
          isDragging: true,
          left: dragInfo.current.elemX + (moveEvent.clientX - dragInfo.current.startX),
          top: dragInfo.current.elemY + (moveEvent.clientY - dragInfo.current.startY),
        }));
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerup', handlePointerUp);

      if (dragInfo.current.isDragging) {
        const finalLeft = dragInfo.current.elemX + (upEvent.clientX - dragInfo.current.startX);
        const finalTop = dragInfo.current.elemY + (upEvent.clientY - dragInfo.current.startY);
        const center = finalLeft + 28;
        const isLeft = center < window.innerWidth / 2;

        setSide(isLeft ? 'left' : 'right');

        const isDesktop = window.innerWidth >= 768;
        const margin = isDesktop ? 24 : 16;
        const sidebarOffset = isDesktop ? 64 : 0;

        const maxTop = window.innerHeight - 56 - margin;
        const minTop = margin;
        const snappedTop = Math.max(minTop, Math.min(maxTop, finalTop));

        setDragState({
          hasInteracted: true,
          isDragging: false,
          left: isLeft ? margin + sidebarOffset : window.innerWidth - 56 - margin,
          top: snappedTop,
        });
      } else {
        setDragState((prev) => ({ ...prev, isDragging: false }));
      }

      setTimeout(() => {
        dragInfo.current.isDragging = false;
      }, 0);
    };

    target.addEventListener('pointermove', handlePointerMove);
    target.addEventListener('pointerup', handlePointerUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragInfo.current.isDragging || dragState.isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const computeStyle = (): React.CSSProperties => {
    if (!dragState.hasInteracted) return {};

    if (dragState.isDragging) {
      return {
        left: `${dragState.left}px`,
        top: `${dragState.top}px`,
        transition: 'none',
      };
    }

    const isDesktop = window.innerWidth >= 768;
    const margin = isDesktop ? 24 : 16;
    const sidebarOffset = isDesktop ? 64 : 0;

    return {
      left: side === 'left' ? `${margin + sidebarOffset}px` : 'auto',
      right: side === 'right' ? `${margin}px` : 'auto',
      top: `${dragState.top}px`,
      transition: 'all 0.3s ease-out',
    };
  };

  const supportPhone = localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone;
  const message = encodeURIComponent(TEXTS.whatsappButton.defaultMessage);

  return (
    <>
      <style>{`
        body.sidebar-expanded .wa-help-btn-left {
          transform: translateX(192px);
        }
      `}</style>
      <div
        ref={containerRef}
        className={`fixed w-14 h-14 z-[9999] touch-none flex items-center justify-center ${side === 'left' && !dragState.isDragging ? 'wa-help-btn-left' : ''} ${!dragState.hasInteracted ? 'bottom-24 md:bottom-6 right-4 md:right-6' : ''}`}
        style={computeStyle()}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${side === 'right' ? 'right-full mr-3' : 'left-full ml-3'} bg-white px-3 py-1.5 rounded-lg shadow-md text-sm text-gray-700 whitespace-nowrap transition-opacity pointer-events-none ${showTooltip && !dragState.isDragging ? 'opacity-100' : 'opacity-0'}`}
        >
          {TEXTS.whatsappButton.tooltip}
        </div>
        <a
          href={`https://wa.me/${supportPhone}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className={`w-full h-full bg-[#25d366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${dragState.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'}`}
        >
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <MessageCircle size={32} className="text-white" />
          </div>
          <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
            <Phone size={14} className="text-white" />
          </div>
        </a>
      </div>
    </>
  );
};

export default WhatsAppHelpButton;
