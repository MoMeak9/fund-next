import Link from "next/link";
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
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-muted/30 px-4 py-5 md:block">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <ListChecks className="h-5 w-5" />
        Fund Next
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
