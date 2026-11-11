import * as React from "react";
import {
  Smartphone,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  BookOpen,
  ShoppingBasket,
  Baby,
  Package,
  Headphones,
  Watch,
  Camera,
  Laptop,
  Utensils,
  Sofa,
  Footprints,
  Handbag,
  HeartPulse,
  Tent,
  PenLine,
  Coffee,
  Apple,
  Gamepad2,
  LucideProps,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  Smartphone,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  BookOpen,
  ShoppingBasket,
  Baby,
  Package,
  Headphones,
  Watch,
  Camera,
  Laptop,
  Utensils,
  Sofa,
  Footprints,
  Handbag,
  HeartPulse,
  Tent,
  PenLine,
  Coffee,
  Apple,
  Gamepad2,
};

/** آیکون دسته‌بندی بر اساس نام آیکون ذخیره‌شده در دیتابیس */
export function CategoryIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && MAP[name]) || Package;
  return <Icon className={className} strokeWidth={1.9} />;
}
