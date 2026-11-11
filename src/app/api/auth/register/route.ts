import { registerSchema } from "@/lib/validators";
import { register } from "@/lib/services/auth";
import { ok, route } from "@/lib/api";

export const POST = route(async (req: Request) => {
  const body = await req.json();
  const input = registerSchema.parse(body);
  const user = await register(input);
  return ok({ user });
});
