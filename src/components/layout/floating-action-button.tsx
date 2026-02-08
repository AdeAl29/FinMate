"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

const hiddenPaths = ["/transactions/new"];

export function FloatingActionButton() {
  const pathname = usePathname();
  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <Link
      href="/transactions/new"
      aria-label="Add transaction"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-700"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
