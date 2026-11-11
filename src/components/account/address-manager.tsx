"use client";

import * as React from "react";
import { Check, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { AddressForm } from "@/components/checkout/address-form";
import { toPersianDigits } from "@/lib/format";
import type { AddressDTO } from "@/types";

export function AddressManager({ initial }: { initial: AddressDTO[] }) {
  const toast = useToast();
  const [items, setItems] = React.useState<AddressDTO[]>(initial);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const editing = editingId ? items.find((a) => a.id === editingId) ?? null : null;

  const openAdd = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const onSaved = (address: AddressDTO) => {
    setItems((prev) => {
      const without = prev.filter((a) => a.id !== address.id);
      const normalized = address.isDefault
        ? without.map((a) => ({ ...a, isDefault: false }))
        : without;
      const next = [address, ...normalized];
      return next.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    });
    closeForm();
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("حذف آدرس انجام نشد", json.message);
        return;
      }
      setItems((prev) => prev.filter((a) => a.id !== id));
      setConfirmDelete(null);
      toast.success("آدرس حذف شد");
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setBusyId(null);
    }
  };

  const makeDefault = async (address: AddressDTO) => {
    setBusyId(address.id);
    try {
      const res = await fetch(`/api/account/addresses/${address.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: address.label,
          receiverName: address.receiverName,
          receiverPhone: address.receiverPhone,
          province: address.province,
          city: address.city,
          postalCode: address.postalCode,
          address: address.address,
          isDefault: true,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { address: AddressDTO };
      };
      if (!res.ok || !json.ok || !json.data) {
        toast.error("ثبت آدرس پیش‌فرض انجام نشد", json.message);
        return;
      }
      setItems((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === address.id,
        })),
      );
      toast.success("آدرس پیش‌فرض به‌روزرسانی شد");
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-black text-ink-900">آدرس‌های من</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            آدرس‌های تحویل سفارش را مدیریت کنید. حداکثر ۵ آدرس پیشنهاد می‌شود.
          </p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            آدرس جدید
          </Button>
        )}
      </div>

      {showForm && (
        <AddressForm
          initial={editing}
          addressId={editingId}
          onSaved={onSaved}
          onCancel={closeForm}
        />
      )}

      {items.length === 0 && !showForm ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="هنوز آدرسی ثبت نکرده‌اید"
          description="برای ثبت سفارش حداقل یک آدرس تحویل نیاز دارید."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              افزودن آدرس
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black text-ink-900">{a.label}</span>
                  {a.isDefault && (
                    <Badge variant="brand" size="xs">
                      پیش‌فرض
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(a.id)}
                    aria-label="ویرایش آدرس"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(a.id)}
                    aria-label="حذف آدرس"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-[12px] font-bold text-ink-800">
                {a.receiverName} — {toPersianDigits(a.receiverPhone)}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-ink-500">
                {a.province}، {a.city}، {a.address}
              </p>
              <p className="mt-0.5 text-[10px] text-ink-400">
                کد پستی: {toPersianDigits(a.postalCode)}
              </p>

              {confirmDelete === a.id ? (
                <div className="mt-3 rounded-lg bg-danger-50 p-2.5">
                  <p className="text-[11px] font-bold text-danger-700">
                    این آدرس حذف شود؟
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => remove(a.id)}
                      loading={busyId === a.id}
                      disabled={busyId === a.id}
                    >
                      <Check className="h-3.5 w-3.5" />
                      حذف
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                      انصراف
                    </Button>
                  </div>
                </div>
              ) : (
                !a.isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault(a)}
                    disabled={busyId === a.id}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[10px] font-bold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                  >
                    <Star className="h-3.5 w-3.5" />
                    {busyId === a.id ? "در حال ثبت…" : "انتخاب به‌عنوان پیش‌فرض"}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
