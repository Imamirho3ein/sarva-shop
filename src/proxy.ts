import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic route protection.
 *
 * This only checks whether the session cookie exists, so it is cheap and runs
 * before the page renders. Real authorization (signature/expiry verification,
 * role checks, active-user checks) always happens server-side in
 * `getSession` / `requireAdminPage`. Never rely on this file for security.
 */

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "sarva_session";
const LOGIN_PATH = "/login";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  // Let signed-in visitors land on the login page (and switch accounts) without
  // bouncing them back to a protected page they may not have access to.
  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  const next = `${pathname}${search}`;
  loginUrl.searchParams.set("next", next);
  if (isAdminArea) loginUrl.searchParams.set("admin", "1");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
