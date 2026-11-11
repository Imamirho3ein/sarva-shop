import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div className="min-h-[70vh] bg-ink-50/70">
      <div className="container-site py-4 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminSidebar user={{ name: session.name, email: session.email }} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
