import Link from "next/link";

import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-muted-foreground">登录你的 Fund Next 账户</p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <Link className="mt-4 text-sm text-primary" href="/register">
        创建账户
      </Link>
    </div>
    </main>
  );
}
