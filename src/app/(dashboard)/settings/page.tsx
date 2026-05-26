"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProfileForm } from "@/features/settings/ProfileForm";
import { PasswordForm } from "@/features/settings/PasswordForm";
import { useLogout } from "@/features/settings/hooks";

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">设置</h1>
      {user && <ProfileForm currentNickname={user.nickname} />}
      <PasswordForm />
      <Button variant="destructive" onClick={handleLogout}>
        退出登录
      </Button>
    </section>
  );
}
