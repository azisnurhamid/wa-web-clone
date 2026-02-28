
import { useEffect } from 'react';

export const useContentProtection = () => {
  useEffect(() => {
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const blockedKeys = ['c', 'v', 'x', 'a', 's', 'u', 'i', 'j', 'k', 'p', 'o', 'n', 't', 'w'];
        
        if (blockedKeys.includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.ctrlKey && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (['i', 'j', 'c', 'k'].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    let printScreenInterval: ReturnType<typeof setInterval> | null = null;

    const detectPrintScreen = () => {
      if (navigator.clipboard && navigator.clipboard.read) {
        navigator.clipboard.read().then((items) => {
          for (const item of items) {
            if (item.types.includes('image/png')) {
              console.log('Screenshot attempt detected');
            }
          }
        }).catch(() => {});
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          console.log('Developer tools detected');
        }
      };
      
      setInterval(checkDevTools, 1000);
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('drop', preventDrag);
    document.addEventListener('cut', preventSelection);
    document.addEventListener('copy', preventSelection);
    document.addEventListener('paste', preventSelection);

    printScreenInterval = setInterval(detectPrintScreen, 1000);

    detectDevTools();

    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('drop', preventDrag);
      document.removeEventListener('cut', preventSelection);
      document.removeEventListener('copy', preventSelection);
      document.removeEventListener('paste', preventSelection);
      
      if (printScreenInterval) {
        clearInterval(printScreenInterval);
      }
    };
  }, []);
};
