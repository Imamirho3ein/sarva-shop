"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function UserActions({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = React.useState<"role" | "active" | null>(null);

  const update = async (
    patch: { role?: "USER" | "ADMIN"; isActive?: boolean },
    kind: "role" | "active",
  ) => {
    setSaving(kind);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("تغییر انجام نشد", json.message);
        return;
      }
      toast.success("حساب کاربری به‌روزرسانی شد");
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(null);
    }
  };

  const toggleRole = () =>
    update({ role: role === "ADMIN" ? "USER" : "ADMIN" }, "role");

  const toggleActive = () => update({ isActive: !isActive }, "active");

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={toggleRole}
        disabled={isSelf || saving !== null}
        title={isSelf ? "نمی‌توانید نقش خودتان را تغییر دهید" : undefined}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          role === "ADMIN"
            ? "text-accent-700 hover:bg-accent-100"
            : "text-brand-700 hover:bg-brand-50",
        )}
      >
        {role === "ADMIN" ? (
          <ShieldOff className="h-3.5 w-3.5" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {role === "ADMIN" ? "سلب مدیریت" : "ارتقا به مدیر"}
      </button>
      <button
        type="button"
        onClick={toggleActive}
        disabled={isSelf || saving !== null}
        title={isSelf ? "نمی‌توانید حساب خودتان را غیرفعال کنید" : undefined}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          isActive
            ? "text-danger-600 hover:bg-danger-50"
            : "text-success-600 hover:bg-success-100/60",
        )}
      >
        {isActive ? (
          <UserX className="h-3.5 w-3.5" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}
        {isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
      </button>
    </div>
  );
}
