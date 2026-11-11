import type { Metadata } from "next";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = {
  title: `علاقه‌مندی‌های من`,
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return <WishlistView />;
}
