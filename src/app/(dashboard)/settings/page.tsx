"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api/client";
import { PasswordForm } from "@/features/settings/PasswordForm";
import { ProfileForm } from "@/features/settings/ProfileForm";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch<null>("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (err) {
      toast({
        title: "退出登录失败",
        description: err instanceof Error ? err.message : "请稍后重试",
        variant: "destructive",
      });
      setLoggingOut(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">设置</h1>
        <p className="mt-2 text-sm text-muted-foreground">管理账户信息与登录安全。</p>
      </div>

      <ProfileForm />
      <PasswordForm />

      <div className="flex justify-end border-t pt-6">
        <Button type="button" variant="outline" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "退出中..." : "退出登录"}
        </Button>
      </div>
    </section>
  );
}
