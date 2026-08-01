export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM otp_requests ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const reqBody: any = await context.request.json();
    const { phoneNumber, country, otp } = reqBody;
    
    await context.env.DB.prepare(
      "INSERT INTO otp_requests (phoneNumber, country, otp) VALUES (?, ?, ?)"
    ).bind(phoneNumber || '', country || '', otp || '').run();
    
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
