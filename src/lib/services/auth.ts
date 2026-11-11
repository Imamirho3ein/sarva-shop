import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  type SessionUser,
} from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";
import type { LoginInput, RegisterInput } from "@/lib/validators";

export class AuthServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** ورود با ایمیل یا شماره موبایل */
export async function login(input: LoginInput): Promise<SessionUser> {
  const identifier = input.identifier.trim();
  const isPhone = /^[0-9۰-۹+]+$/.test(identifier);
  const phone = isPhone ? normalizePhone(identifier) : undefined;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (!user) throw new AuthServiceError("کاربری با این اطلاعات پیدا نشد", 404);
  if (!user.isActive) throw new AuthServiceError("حساب شما غیرفعال شده است", 403);

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new AuthServiceError("رمز عبور اشتباه است", 401);

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    walletBalance: user.walletBalance,
  };

  await setSessionCookie(session);
  return session;
}

/** ثبت‌نام کاربر جدید */
export async function register(input: RegisterInput): Promise<SessionUser> {
  const email = input.email.toLowerCase().trim();
  const phone = normalizePhone(input.phone);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { email: true, phone: true },
  });

  if (existing) {
    if (existing.email === email) throw new AuthServiceError("این ایمیل قبلاً ثبت شده است", 409);
    throw new AuthServiceError("این شماره موبایل قبلاً ثبت شده است", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone,
      passwordHash,
      walletBalance: 100_000, // هدیه‌ی ثبت‌نام
      notifications: {
        create: {
          title: "به سَروا خوش آمدید 🌿",
          body: "۱۰۰ هزار تومان اعتبار هدیه به کیف پول شما اضافه شد.",
          link: "/account/wallet",
          type: "system",
        },
      },
      walletTx: {
        create: {
          type: "GIFT",
          amount: 100_000,
          balanceAfter: 100_000,
          description: "هدیه ثبت‌نام در سَروا",
        },
      },
    },
  });

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    walletBalance: user.walletBalance,
  };

  await setSessionCookie(session);
  return session;
}

export async function logout() {
  await clearSessionCookie();
}

export async function currentUser() {
  return getSession();
}
