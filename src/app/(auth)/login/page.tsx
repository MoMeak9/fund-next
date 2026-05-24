import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-muted-foreground">邮箱登录表单将在认证任务中实现。</p>
      <div className="mt-6">
        <Button>登录占位</Button>
      </div>
      <Link className="mt-4 text-sm text-primary" href="/register">
        创建账户
      </Link>
    </main>
  );
}
