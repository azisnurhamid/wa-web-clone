import { Env } from './settings';
import botReplies from '../../src/data/json/bot-replies.json';
import contacts from '../../src/data/json/contacts.json';
import scenarios from '../../src/data/json/scenarios.json';
import appConfig from '../../src/config/app.json';
import assetsConfig from '../../src/config/assets.json';
import paymentConfig from '../../src/config/payment.json';
import seoConfig from '../../src/config/seo.json';
import themeConfig from '../../src/config/theme.json';
import idLocales from '../../src/config/locales/id.json';
import enLocales from '../../src/config/locales/en.json';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const dataToSeed = [
      { key: 'bot-replies', value: JSON.stringify(botReplies) },
      { key: 'contacts', value: JSON.stringify(contacts) },
      { key: 'scenarios', value: JSON.stringify(scenarios) },
      { key: 'app', value: JSON.stringify(appConfig) },
      { key: 'assets', value: JSON.stringify(assetsConfig) },
      { key: 'payment', value: JSON.stringify(paymentConfig) },
      { key: 'seo', value: JSON.stringify(seoConfig) },
      { key: 'theme', value: JSON.stringify(themeConfig) },
      { key: 'locales-id', value: JSON.stringify(idLocales) },
      { key: 'locales-en', value: JSON.stringify(enLocales) },
    ];

    const stmt = context.env.DB.prepare(
      `INSERT INTO app_settings (key, value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP) 
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`
    );

    const batch = dataToSeed.map((item) => stmt.bind(item.key, item.value));
    
    await context.env.DB.batch(batch);

    return new Response(JSON.stringify({ success: true, message: "Successfully seeded D1 database" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
