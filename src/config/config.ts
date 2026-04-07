import config from './config.json';

export const COLORS = config.colors;
export const TIMING = config.timing;
export const TEXTS = config.texts;
export const URLS = config.urls;
export const LABELS = config.texts;
export const MOCK_DATA = config.mockData;
export const APP_CONFIG = {
  ...config.app,
  supportEmail: config.app.supportEmail
};
