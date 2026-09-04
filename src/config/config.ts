import idTexts from './locales/id.json';
import enTexts from './locales/en.json';
import theme from './theme.json';
import assets from './assets.json';
import appConfig from './app.json';

export const COLORS = theme.colors;
export const TIMING = appConfig.timing;

export const getCurrentHost = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.host) {
    return window.location.host;
  }
  return 'recover.web.id';
};

export const getCurrentHostname = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'recover.web.id';
};

export const getDeviceLanguage = (): 'id' | 'en' => {
  if (typeof window === 'undefined') return 'id';

  const saved = localStorage.getItem('wa_lang');
  if (saved === 'en' || saved === 'id') {
    return saved;
  }

  const browserLangs = navigator.languages || [navigator.language || ''];
  for (const lang of browserLangs) {
    const code = lang.toLowerCase();
    if (code.startsWith('en')) return 'en';
    if (code.startsWith('id') || code.startsWith('in')) return 'id';
  }

  return 'id';
};

export const getTexts = (lang?: string) => {
  const currentLang = lang || getDeviceLanguage();
  const baseTexts = currentLang === 'en' ? enTexts : idTexts;
  const currentHost = getCurrentHost();

  return {
    ...baseTexts,
    preview: {
      ...baseTexts.preview,
      urlDomain: `${currentHost}/live-monitor/dashboard`,
    },
  };
};

export const TEXTS: typeof idTexts = new Proxy({} as any, {
  get(_target, prop) {
    const texts = getTexts();
    return (texts as any)[prop];
  },
});

export const URLS = new Proxy(assets.urls, {
  get(target, prop) {
    if (prop === 'dashboard') {
      const currentHost = getCurrentHost();
      return {
        ...target.dashboard,
        mockDomain: `${currentHost}/live-monitor/dashboard`,
      };
    }
    return (target as any)[prop];
  },
});

export const ICONS = assets.icons;

export const APP_CONFIG = new Proxy(
  {
    ...appConfig.app,
  },
  {
    get(target, prop) {
      if (prop === 'supportEmail') {
        const hostname = getCurrentHostname();
        return `support@${hostname}`;
      }
      return (target as any)[prop];
    },
  }
);

export const PRIVACY_CONFIG = appConfig.privacy;
export const DASHBOARD_CONFIG = appConfig.dashboard;



