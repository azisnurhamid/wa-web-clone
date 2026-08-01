export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM otp_requests ORDER BY created_at DESC"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
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
    const { phoneNumber, country, otp } = requestData;

    if (!phoneNumber || !country || !otp) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await context.env.DB.prepare(
      "INSERT INTO otp_requests (phoneNumber, country, otp) VALUES (?, ?, ?) RETURNING *"
    ).bind(phoneNumber, country, otp).first();

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
