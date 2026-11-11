import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * بررسی سلامت استقرار — بدون افشای رمز دیتابیس.
 * آدرس: /api/health
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function describeTarget(raw: string | undefined) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, ""),
      sslmode: url.searchParams.get("sslmode"),
    };
  } catch {
    return { invalid: true };
  }
}

export async function GET() {
  const startedAt = Date.now();
  const databaseUrl = process.env.DATABASE_URL;
  const target = describeTarget(databaseUrl);

  if (!databaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        step: "env",
        message: "متغیر محیطی DATABASE_URL تنظیم نشده است.",
        checks: { databaseUrl: false, connection: false, tables: false },
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        step: "connection",
        message: "اتصال به پایگاه داده برقرار نشد.",
        error: error instanceof Error ? error.message.split("\n").slice(0, 4).join(" | ") : String(error),
        target,
        checks: { databaseUrl: true, connection: false, tables: false },
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }

  try {
    const [products, orders, users] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      ok: true,
      step: "ready",
      target,
      checks: { databaseUrl: true, connection: true, tables: true },
      counts: { products, orders, users },
      seeded: products > 0,
      latencyMs: Date.now() - startedAt,
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        step: "schema",
        message: "اتصال برقرار است اما جدول‌ها ساخته نشده‌اند. دستور `npm run db:push` را اجرا کنید.",
        error: error instanceof Error ? error.message.split("\n").slice(0, 4).join(" | ") : String(error),
        target,
        checks: { databaseUrl: true, connection: true, tables: false },
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
