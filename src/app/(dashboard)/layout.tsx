import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-8">{children}</main>
      </div>
    </div>
  );
}
