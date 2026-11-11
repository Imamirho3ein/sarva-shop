import { loginSchema } from "@/lib/validators";
import { login } from "@/lib/services/auth";
import { ok, route } from "@/lib/api";

export const POST = route(async (req: Request) => {
  const body = await req.json();
  const input = loginSchema.parse(body);
  const user = await login(input);
  return ok({ user });
});
