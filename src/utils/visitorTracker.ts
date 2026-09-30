export const trackVisitor = async () => {
  if (sessionStorage.getItem('visitor_logged')) {
    return;
  }

  try {
    const getOS = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'MacOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('like Mac')) return 'iOS';
      return 'Unknown';
    };

    const getBrowser = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
      if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
      if (ua.includes('Trident')) return 'Internet Explorer';
      if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Safari')) return 'Safari';
      return 'Unknown';
    };

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
      if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
      return 'Desktop';
    };

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType : 'Unknown';

    const data = {
      os: getOS(),
      browser: getBrowser(),
      deviceType: getDeviceType(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      connectionType: connectionType
    };

    await fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    sessionStorage.setItem('visitor_logged', 'true');
  } catch (error) {
    console.error('Failed to log visitor', error);
  }
};
