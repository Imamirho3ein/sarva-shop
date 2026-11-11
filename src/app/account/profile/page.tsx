import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: `اطلاعات حساب`,
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <ProfileForm
      initial={{
        name: session.name,
        email: session.email,
        phone: session.phone,
      }}
    />
  );
}
