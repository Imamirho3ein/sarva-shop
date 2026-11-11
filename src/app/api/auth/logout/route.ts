import { logout } from "@/lib/services/auth";
import { ok, route } from "@/lib/api";

export const POST = route(async () => {
  await logout();
  return ok({ loggedOut: true });
});
