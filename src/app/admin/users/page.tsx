import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatPrice, toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { UserActions } from "@/components/admin/user-actions";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "کاربران | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; active?: string; page?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const role = (params.role ?? "").toUpperCase();
  const active = params.active ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.UserWhereInput = {
    ...(role === "ADMIN" || role === "USER" ? { role } : {}),
    ...(active === "1" ? { isActive: true } : active === "0" ? { isActive: false } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [users, total, roleGroups] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        walletBalance: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const roleCounts: Record<string, number> = {};
  for (const row of roleGroups) roleCounts[row.role] = row._count._all;

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (role === "ADMIN" || role === "USER") query.set("role", role);
    if (active) query.set("active", active);
    query.set("page", "{page}");
    return `/admin/users?${query.toString()}`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Users className="h-4 w-4" />
            </span>
            مدیریت کاربران
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(total)} کاربر با فیلتر فعلی —{" "}
            {toPersianDigits(roleCounts.ADMIN ?? 0)} مدیر،{" "}
            {toPersianDigits(roleCounts.USER ?? 0)} مشتری
          </p>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="نام، ایمیل یا شماره موبایل…"
            className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-9 pl-3 text-[12px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
        </div>
        <select
          name="role"
          defaultValue={role}
          className="h-10 min-w-32 rounded-xl border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">همه نقش‌ها</option>
          <option value="USER">مشتری</option>
          <option value="ADMIN">مدیر</option>
        </select>
        <select
          name="active"
          defaultValue={active}
          className="h-10 min-w-32 rounded-xl border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="1">فعال</option>
          <option value="0">غیرفعال</option>
        </select>
        <Button type="submit" size="sm" variant="outline">
          <Filter className="h-3.5 w-3.5" />
          اعمال فیلتر
        </Button>
        {(q || role || active) && (
          <Link
            href="/admin/users"
            className="text-[10px] font-bold text-ink-500 hover:text-danger-600"
          >
            حذف فیلترها
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="کاربری پیدا نشد"
          description="با تغییر فیلترها دوباره جستجو کنید."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-right text-[11px]">
              <thead className="bg-ink-50 text-[9px] text-ink-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">کاربر</th>
                  <th className="px-3 py-2.5 font-medium">موبایل</th>
                  <th className="px-3 py-2.5 font-medium">نقش</th>
                  <th className="px-3 py-2.5 font-medium">وضعیت</th>
                  <th className="px-3 py-2.5 font-medium">سفارش‌ها</th>
                  <th className="px-3 py-2.5 font-medium">کیف پول</th>
                  <th className="px-3 py-2.5 font-medium">عضویت</th>
                  <th className="px-3 py-2.5 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-ink-50/50">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12px] font-black text-brand-700">
                          {user.name.trim().charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black text-ink-800">
                            {user.name}
                            {user.id === session?.id && (
                              <span className="mr-1 text-[9px] font-bold text-brand-600">
                                (شما)
                              </span>
                            )}
                          </p>
                          <p dir="ltr" className="mt-0.5 text-right text-[9px] text-ink-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td dir="ltr" className="px-3 py-2.5 text-right text-[10px] text-ink-500">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={user.role === "ADMIN" ? "accent" : "outline"}
                        size="xs"
                      >
                        {user.role === "ADMIN" ? "مدیر" : "مشتری"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={user.isActive ? "success" : "danger"} size="xs">
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                        className="font-bold text-brand-700 hover:underline"
                      >
                        {toPersianDigits(user._count.orders)}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] font-bold text-ink-600">
                      {formatPrice(user.walletBalance)}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-ink-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <UserActions
                        userId={user.id}
                        role={user.role}
                        isActive={user.isActive}
                        isSelf={user.id === session?.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 p-3">
            <p className="text-[10px] text-ink-500">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </p>
            <Pagination page={page} totalPages={totalPages} hrefBase={hrefBase} />
          </div>
        </div>
      )}
    </div>
  );
}
