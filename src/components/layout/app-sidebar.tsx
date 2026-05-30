"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  ClipboardList,
  Flag,
  Gauge,
  Layers3,
  ListChecks,
  Settings,
  Star,
  WalletCards,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUiStore } from "@/store/ui";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/assets", label: "资产", icon: WalletCards },
  { href: "/exposure", label: "基金穿透", icon: Layers3 },
  { href: "/transactions", label: "交易复盘", icon: ClipboardList },
  { href: "/goals", label: "目标规划", icon: Flag },
  { href: "/watchlist", label: "自选资产", icon: Star },
  { href: "/reports", label: "报表", icon: BarChart3 },
  { href: "/ai", label: "AI 分析", icon: Bot },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <ListChecks className="h-5 w-5" />
        Fund Next
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={
                isActive
                  ? "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-primary/10 text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  : "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-64 border-r bg-muted/30 px-4 py-5 md:block">
        {navContent}
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-4 md:hidden">
          {navContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
