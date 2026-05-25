import Link from "next/link";

import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">注册</h1>
      <p className="mt-2 text-sm text-muted-foreground">创建你的 Fund Next 账户</p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <Link className="mt-4 text-sm text-primary" href="/login">
        已有账户，去登录
      </Link>
    </main>
  );
}
