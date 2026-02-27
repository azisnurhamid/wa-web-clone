import config from './config.json';

export const APP_CONFIG = config;

export const getText = (path: string): string => {
  const keys = path.split('.');
  let value: any = config;
  for (const key of keys) {
    value = value?.[key];
  }
  return value || path;
};

export const COLORS = config.colors;
export const TIMING = config.timing;
export const TEXTS = config.texts;
export const URLS = config.urls;
export const MOCK_DATA = config.mockData;
