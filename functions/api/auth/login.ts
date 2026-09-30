export interface Env {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const { username, password } = body || {};

    const expectedUsername = context.env.ADMIN_USERNAME || "Owner";
    const expectedPassword = context.env.ADMIN_PASSWORD || "421$_2ur_h431D";

    if (username === expectedUsername && password === expectedPassword) {
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: "Username atau password salah" },
      { status: 401 }
    );
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
