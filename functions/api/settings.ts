export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get('key');

    if (key) {
      const result = await context.env.DB.prepare(
        "SELECT * FROM app_settings WHERE key = ?"
      ).bind(key).first();
      
      return new Response(JSON.stringify(result || null), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM app_settings"
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const requestData = await context.request.json() as any;
    const { key, value } = requestData;

    if (!key || value === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await context.env.DB.prepare(
      `INSERT INTO app_settings (key, value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP) 
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP 
       RETURNING *`
    ).bind(key, value).first();

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
