export const trackVisitor = async () => {
  if (sessionStorage.getItem('visitor_logged')) {
    return;
  }

  try {
    let batteryData = 'Unknown';
    try {
      if ((navigator as any).getBattery) {
        const battery: any = await (navigator as any).getBattery();
        batteryData = `${Math.round(battery.level * 100)}% ${battery.charging ? '(Charging)' : ''}`;
      }
    } catch (e) {}

    let gpuData = 'Unknown';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || (canvas as any).getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuData = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {}

    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Unknown';
    const ram = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown';
    const touchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ? 'Yes' : 'No';
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
    const referrer = document.referrer || 'Direct';
    const visibility = document.visibilityState || 'Unknown';

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
      connectionType: connectionType,
      cpu_cores: cpuCores,
      ram: ram,
      gpu: gpuData,
      battery: batteryData,
      touch_support: touchSupport,
      referrer: referrer,
      visibility: visibility,
      dark_mode: darkMode
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
