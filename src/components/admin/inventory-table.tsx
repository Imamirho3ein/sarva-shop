"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type InventoryRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName: string;
  brandName: string | null;
  stock: number;
  reservedStock: number;
  price: number;
  discountPrice: number | null;
  soldCount: number;
};

type Draft = {
  stock: number;
  reservedStock: number;
  price: number;
  discountPrice: number | null;
};

function draftFrom(row: InventoryRow): Draft {
  return {
    stock: row.stock,
    reservedStock: row.reservedStock,
    price: row.price,
    discountPrice: row.discountPrice,
  };
}

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, draftFrom(r)])),
  );
  const [savingId, setSavingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDrafts(Object.fromEntries(rows.map((r) => [r.id, draftFrom(r)])));
  }, [rows]);

  const setField = <K extends keyof Draft>(
    id: string,
    key: K,
    value: Draft[K],
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { stock: 0, reservedStock: 0, price: 0, discountPrice: null }), [key]: value },
    }));
  };

  const reset = (row: InventoryRow) => {
    setDrafts((prev) => ({ ...prev, [row.id]: draftFrom(row) }));
  };

  const save = async (row: InventoryRow) => {
    const draft = drafts[row.id];
    if (!draft) return;
    if (draft.discountPrice && draft.discountPrice >= draft.price) {
      toast.error("قیمت تخفیف نامعتبر", "قیمت با تخفیف باید کمتر از قیمت اصلی باشد.");
      return;
    }

    setSavingId(row.id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          stock: Number(draft.stock) || 0,
          reservedStock: Number(draft.reservedStock) || 0,
          price: Number(draft.price) || 0,
          discountPrice:
            draft.discountPrice && Number(draft.discountPrice) > 0
              ? Number(draft.discountPrice)
              : null,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("ذخیره انجام نشد", json.message);
        return;
      }
      toast.success("انبار به‌روزرسانی شد", row.name);
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setSavingId(null);
    }
  };

  const dirty = (row: InventoryRow) => {
    const draft = drafts[row.id];
    if (!draft) return false;
    return (
      draft.stock !== row.stock ||
      draft.reservedStock !== row.reservedStock ||
      draft.price !== row.price ||
      (draft.discountPrice ?? null) !== (row.discountPrice ?? null)
    );
  };

  const inputClass =
    "h-8 w-24 rounded-lg border border-ink-200 bg-white px-2 text-[11px] text-ink-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/10";

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-right text-[11px]">
          <thead className="bg-ink-50 text-[9px] text-ink-500">
            <tr>
              <th className="px-3 py-2.5 font-medium">محصول</th>
              <th className="px-3 py-2.5 font-medium">دسته / برند</th>
              <th className="px-3 py-2.5 font-medium">موجودی</th>
              <th className="px-3 py-2.5 font-medium">رزرو</th>
              <th className="px-3 py-2.5 font-medium">قیمت</th>
              <th className="px-3 py-2.5 font-medium">قیمت با تخفیف</th>
              <th className="px-3 py-2.5 font-medium">فروش</th>
              <th className="px-3 py-2.5 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row) => {
              const draft = drafts[row.id] ?? draftFrom(row);
              const available = draft.stock - draft.reservedStock;
              const changed = dirty(row);
              return (
                <tr
                  key={row.id}
                  className={cn("hover:bg-ink-50/50", changed && "bg-warning-100/20")}
                >
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/products/${row.id}`}
                      className="line-clamp-1 font-black text-ink-800 hover:text-brand-700"
                    >
                      {row.name}
                    </Link>
                    <p dir="ltr" className="mt-0.5 text-right text-[9px] text-ink-400">
                      {row.sku}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-ink-700">{row.categoryName}</p>
                    <p className="mt-0.5 text-[9px] text-ink-400">
                      {row.brandName ?? "بدون برند"}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) =>
                        setField(row.id, "stock", Number(e.target.value) || 0)
                      }
                      className={inputClass}
                      aria-label={`موجودی ${row.name}`}
                    />
                    <p
                      className={cn(
                        "mt-1 text-[9px] font-bold",
                        available <= 0
                          ? "text-danger-600"
                          : available <= 5
                            ? "text-warning-600"
                            : "text-success-600",
                      )}
                    >
                      قابل فروش: {toPersianDigits(available)}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={draft.reservedStock}
                      onChange={(e) =>
                        setField(
                          row.id,
                          "reservedStock",
                          Number(e.target.value) || 0,
                        )
                      }
                      className={inputClass}
                      aria-label={`رزرو ${row.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.price}
                      onChange={(e) =>
                        setField(row.id, "price", Number(e.target.value) || 0)
                      }
                      className={inputClass}
                      aria-label={`قیمت ${row.name}`}
                    />
                    <p className="mt-1 text-[9px] text-ink-400">
                      {formatPrice(draft.price)}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.discountPrice ?? ""}
                      onChange={(e) =>
                        setField(
                          row.id,
                          "discountPrice",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      placeholder="—"
                      className={inputClass}
                      aria-label={`قیمت با تخفیف ${row.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-ink-600">
                    {toPersianDigits(row.soldCount)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => save(row)}
                        loading={savingId === row.id}
                        disabled={savingId !== null || !changed}
                        className="h-8 px-2 text-[10px]"
                      >
                        {savingId === row.id ? null : <Save className="h-3.5 w-3.5" />}
                        ذخیره
                      </Button>
                      {changed && (
                        <button
                          type="button"
                          onClick={() => reset(row)}
                          disabled={savingId !== null}
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-ink-500 hover:bg-ink-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          بازگردانی
                        </button>
                      )}
                      {!changed && (
                        <span className="inline-flex h-8 items-center gap-1 px-1 text-[9px] text-success-600">
                          <Check className="h-3 w-3" />
                          ذخیره‌شده
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-ink-400">
                  محصولی با این فیلتر پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
