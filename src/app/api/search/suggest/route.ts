import { getSuggestionItems } from "@/lib/services/catalog";
import { ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return ok({ items: [] });
  const items = await getSuggestionItems(q);
  return ok({ items });
});
