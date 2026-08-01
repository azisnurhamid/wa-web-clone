import { useData } from '../context/DataProvider';

export const useConfig = () => {
  const { data, loading, error } = useData();

  if (loading || !data) {
    return {
      COLORS: {},
      TIMING: {
        typingDelayMin: 1000,
        typingDelayMax: 3000,
        onlineDurationMin: 5000,
        onlineDurationMax: 15000,
        statusInterval: 60000
      },
      TEXTS: {} as any,
      URLS: {} as any,
      APP_CONFIG: {} as any,
      PRIVACY_CONFIG: {} as any,
      DASHBOARD_CONFIG: {} as any
    };
  }

  const currentLang = localStorage.getItem('wa_lang') || 'id';
  const texts = currentLang === 'en' ? data.locales.en : data.locales.id;

  return {
    COLORS: data.theme.colors,
    TIMING: data.app.timing,
    TEXTS: texts,
    URLS: data.assets.urls,
    APP_CONFIG: {
      ...data.app.app,
      supportEmail: data.app.app.supportEmail
    },
    PRIVACY_CONFIG: data.app.privacy,
    DASHBOARD_CONFIG: data.app.dashboard
  };
};
