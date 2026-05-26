"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateProfile } from "./hooks";

type Props = { currentNickname: string | null };

export function ProfileForm({ currentNickname }: Props) {
  const [nickname, setNickname] = useState(currentNickname ?? "");
  const mutation = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ nickname });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">昵称</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中..." : "保存"}
          </Button>
          {mutation.isSuccess && <p className="text-sm text-green-600">已保存</p>}
          {mutation.isError && <p className="text-sm text-red-600">保存失败</p>}
        </form>
      </CardContent>
    </Card>
  );
}
