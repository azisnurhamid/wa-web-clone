export async function onRequestGet(context: any) {
  const { env } = context;
  try {
    const { results } = await env.WA_DB.prepare(
      `SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 500`
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const body = await request.json();
    
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('User-Agent') || body.userAgent || 'Unknown';
    
    await env.WA_DB.prepare(
      `INSERT INTO visitor_logs (
        ip_address, user_agent, os, browser, device_type, screen_resolution, language, timezone, connection_type, cpu_cores, ram, gpu, battery, touch_support, referrer, visibility, dark_mode, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      ipAddress,
      userAgent,
      body.os || 'Unknown',
      body.browser || 'Unknown',
      body.deviceType || 'Unknown',
      body.screenResolution || 'Unknown',
      body.language || 'Unknown',
      body.timezone || 'Unknown',
      body.connectionType || 'Unknown',
      body.cpu_cores || 'Unknown',
      body.ram || 'Unknown',
      body.gpu || 'Unknown',
      body.battery || 'Unknown',
      body.touch_support || 'Unknown',
      body.referrer || 'Unknown',
      body.visibility || 'Unknown',
      body.dark_mode || 'Unknown',
      body.latitude || null,
      body.longitude || null
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
