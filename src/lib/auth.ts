import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  walletBalance: number;
};

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "sarva_session";
const MAX_AGE = Number(process.env.SESSION_MAX_AGE ?? 60 * 60 * 24 * 30); // ۳۰ روز

function secret(): Uint8Array {
  const value =
    process.env.AUTH_SECRET ?? "dev-only-secret-change-me-in-production-please";
  return new TextEncoder().encode(value);
}

/** صدور توکن نشست (JWT امضاشده) */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** خواندن نشست از کوکی */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret());
    const userId = payload.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return null;

    const { isActive: _ignored, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

/** نشست جاری یا خطا — برای API و صفحات محافظت‌شده */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthError("لاگین نکرده‌اید");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new AuthError("دسترسی غیرمجاز", 403);
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * نشست ادمین برای صفحات پنل مدیریت.
 * در صورت نبود نشست به ورود و در صورت نقش غیرادمین به حساب کاربری هدایت می‌شود.
 */
export async function requireAdminPage(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/account");
  return session;
}


/** ایجاد کوکی نشست */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const store = await cookies();
  const token = await createSessionToken(user);
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** حذف کوکی نشست */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// ------------------------------ رمز عبور ----------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** حذف فیلدهای حساس کاربر برای ارسال به کلاینت */
export function publicUser(user: User) {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}
