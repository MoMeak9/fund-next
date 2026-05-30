"use client";

import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useUiStore } from "@/store/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="打开导航菜单"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold">Fund Next</span>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        <AppSidebar />
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8 animate-fade-in motion-reduce:animate-none">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
