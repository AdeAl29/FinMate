import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { ProtectedRouteGuard } from "@/components/auth/protected-route-guard";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-5">
        <ProtectedRouteGuard>{children}</ProtectedRouteGuard>
      </div>
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
