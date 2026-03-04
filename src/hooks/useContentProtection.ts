
import { useEffect } from 'react';

export const useContentProtection = () => {
  useEffect(() => {
    // ============================================
    // 1. PERLINDUNGAN TERHADAP WEBSITE COPIER
    // (HTTrack, Wget, WebCopy, dll)
    // ============================================
    
    // Blokir request dari tools otomatis
    const blockAutomatedRequests = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const blockedUserAgents = [
        'httrack',
        'wget',
        'webcopy',
        'webcopier',
        'sitesucker',
        'teleport',
        'reaper',
        'offline',
        'scrapbook',
        'googlebot',
        'bingbot',
        'yandex',
        'duckduckbot',
        'curl',
        'libwww',
        'apache-httpclient',
        'python-requests',
        'node-fetch',
        'axios',
        'got',
        'phantomjs',
        'selenium',
        'puppeteer',
        'playwright',
        'apify',
        'scrapy',
      ];
      
      for (const bot of blockedUserAgents) {
        if (userAgent.includes(bot)) {
          document.body.innerHTML = '<div style="padding:50px;text-align:center;font-family:sans-serif;"><h1>Access Denied</h1><p>Automated access is not allowed.</p></div>';
          throw new Error('Access denied');
        }
      }
    };
    
    // Detect dan blokir iframe embedding (mencegah cloned site di iframe)
    const preventIframeEmbedding = () => {
      try {
        // Cek apakah halaman dibuka dalam iframe
        const inIframe = window.top !== window.self;
        if (inIframe && window.top.location.href !== window.self.location.href) {
          // Redirect parent ke halaman saat ini
          window.top.location.replace(window.self.location.href);
        }
      } catch (e) {
        // Access denied - halaman dalam iframe cross-origin
        console.log('Cross-origin iframe detected');
      }
    };
    
    // Disable XMLHttpRequest dan fetch untuk monitoring
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    const originalFetch = window.fetch;
    
    XMLHttpRequest.prototype.open = function(...args: any[]) {
      // Allow normal requests but could add detection here
      return originalXHROpen.apply(this, args);
    };
    
    window.fetch = function(...args: any[]) {
      // Allow normal requests
      return originalFetch.apply(this, args);
    };
    
    // ============================================
    // 2. PERLINDUNGAN SCREENSHOT/PRINTSCREEN
    // ============================================
    
    const preventPrintScreen = (e: KeyboardEvent) => {
      // Blokir PrintScreen, Ctrl+P (Print), Ctrl+S (Save)
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key.toLowerCase() === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        navigator.clipboard.writeText('').catch(() => {});
        return false;
      }
    };
    
    // Monitoring clipboard untuk screenshot detection
    const monitorClipboard = () => {
      setInterval(() => {
        if (navigator.clipboard && navigator.clipboard.read) {
          navigator.clipboard.read().then((items) => {
            for (const item of items) {
              if (item.types.includes('image/png')) {
                // Detect potential screenshot
                console.log('Potential screenshot attempt detected');
                // Clear clipboard
                navigator.clipboard.writeText('').catch(() => {});
              }
            }
          }).catch(() => {});
        }
      }, 500);
    };
    
    // Detect DevTools (bisa digunakan untuk inspect element/screenshot)
    const detectDevTools = () => {
      const threshold = 160;
      const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          console.log('Developer tools detected - possible screenshot tool');
        }
      };
      
      setInterval(checkDevTools, 1000);
    };
    
    // ============================================
    // 3. PERLINDUNGAN COPY-PASTE TEKS
    // ============================================
    
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
    };
    
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    // ============================================
    // JALANKAN SEMUA PERLINDUNGAN
    // ============================================
    
    // Jalankan protection terhadap website copier
    blockAutomatedRequests();
    preventIframeEmbedding();
    
    // Pasang event listeners
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('keydown', preventPrintScreen);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('drop', preventDrag);
    document.addEventListener('cut', preventSelection);
    document.addEventListener('copy', preventSelection);
    document.addEventListener('paste', preventSelection);
    
    // Monitoring
    monitorClipboard();
    detectDevTools();
    
    // Cleanup
    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('keydown', preventPrintScreen);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('drop', preventDrag);
      document.removeEventListener('cut', preventSelection);
      document.removeEventListener('copy', preventSelection);
      document.removeEventListener('paste', preventSelection);
    };
  }, []);
};
