export interface Env {
  WA_DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.WA_DB.prepare(
      "SELECT value FROM app_settings WHERE key = 'app'"
    ).all();
    
    if (results && results.length > 0) {
      return Response.json(JSON.parse(results[0].value as string));
    }
    return Response.json({});
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const payload: any = await context.request.json();
    
    // Get existing to merge
    const { results } = await context.env.WA_DB.prepare(
      "SELECT value FROM app_settings WHERE key = 'app'"
    ).all();
    
    let currentSettings = {};
    if (results && results.length > 0) {
      currentSettings = JSON.parse(results[0].value as string);
    }
    
    const newSettings = { ...currentSettings, ...payload };
    
    await context.env.WA_DB.prepare(
      "INSERT INTO app_settings (key, value) VALUES ('app', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    ).bind(JSON.stringify(newSettings)).run();
    
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
