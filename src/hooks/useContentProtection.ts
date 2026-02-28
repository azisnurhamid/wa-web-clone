import { useEffect } from 'react';

/**
 * Hook untuk mencegah:
 * - Select text
 * - Copy
 * - Paste
 * - Cut
 * - Screenshot (PrintScreen)
 * - Inspect Element
 * - Shortcut keyboard (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U, F12, dll)
 */
export const useContentProtection = () => {
  useEffect(() => {
    // 1. Mencegah selection text
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 2. Mencegah context menu (right click)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Mencegah keyboard shortcuts
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U, Ctrl+I, Ctrl+J, Ctrl+K
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const blockedKeys = ['c', 'v', 'x', 'a', 's', 'u', 'i', 'j', 'k', 'p', 'o', 'n', 't', 'w'];
        
        if (blockedKeys.includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // F12 - Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (['i', 'j', 'c', 'k'].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Print screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 4. Mencegah drag and drop
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Mendeteksi PrintScreen dengan interval
    let printScreenInterval: ReturnType<typeof setInterval> | null = null;

    const detectPrintScreen = () => {
      // Check if clipboard contains image
      if (navigator.clipboard && navigator.clipboard.read) {
        navigator.clipboard.read().then((items) => {
          for (const item of items) {
            if (item.types.includes('image/png')) {
              // PrintScreen terdeteksi - bisa tambahkan action tambahan
              console.log('Screenshot attempt detected');
            }
          }
        }).catch(() => {});
      }
    };

    // 6. Mencegah Inspect Element (disable right click pada devtools)
    const detectDevTools = () => {
      const threshold = 160;
      const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          // DevTools terbuka - bisa tambahkan action
          console.log('Developer tools detected');
        }
      };
      
      setInterval(checkDevTools, 1000);
    };

    // Menambahkan event listeners
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('drop', preventDrag);
    document.addEventListener('cut', preventSelection);
    document.addEventListener('copy', preventSelection);
    document.addEventListener('paste', preventSelection);

    // Aktifkan detectPrintScreen
    printScreenInterval = setInterval(detectPrintScreen, 1000);

    // Aktifkan detectDevTools
    detectDevTools();

    // Cleanup
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
