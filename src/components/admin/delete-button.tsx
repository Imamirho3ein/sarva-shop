"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function DeleteButton({
  endpoint,
  itemName,
  description,
  redirectTo,
  label = "حذف",
}: {
  endpoint: string;
  itemName: string;
  description?: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("حذف انجام نشد", json.message);
        return;
      }
      toast.success("با موفقیت حذف شد", itemName);
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-danger-600 transition-colors hover:bg-danger-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <TriangleAlert className="h-5 w-5 text-danger-600" />
              حذف {itemName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-[12px] leading-6 text-ink-600">
              {description ?? "این عملیات قابل بازگشت نیست. آیا از حذف مطمئن هستید؟"}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
              انصراف
            </Button>
            <Button variant="danger" onClick={remove} loading={deleting} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
              بله، حذف شود
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
