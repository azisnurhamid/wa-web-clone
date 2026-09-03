import idTexts from './locales/id.json';
import enTexts from './locales/en.json';
import theme from './theme.json';
import assets from './assets.json';
import appConfig from './app.json';
import paymentConfig from './payment.json';
import seoConfig from './seo.json';

export const COLORS = theme.colors;
export const TIMING = appConfig.timing;

const currentLang = localStorage.getItem('wa_lang') || 'id';
const texts = currentLang === 'en' ? enTexts : idTexts;

export const TEXTS = texts;
export const URLS = assets.urls;
export const APP_CONFIG = {
  ...appConfig.app,
  supportEmail: appConfig.app.supportEmail,
};
export const PRIVACY_CONFIG = appConfig.privacy;
export const DASHBOARD_CONFIG = appConfig.dashboard;
export const PAYMENT_CONFIG = paymentConfig;
export const SEO_CONFIG = seoConfig;

