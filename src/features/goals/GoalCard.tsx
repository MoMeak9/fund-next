"use client";

import { useState } from "react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { useDeleteGoal, type GoalAllocation } from "./hooks";

type Props = {
  id: string;
  goalName: string;
  targetAmount: number;
  completionRate: number;
  remainingAmount: number;
  monthlyRequired: number;
  currentPrincipal: number;
  allocations?: GoalAllocation[];
};

export function GoalCard({
  id,
  goalName,
  targetAmount,
  completionRate,
  remainingAmount,
  monthlyRequired,
  currentPrincipal,
  allocations,
}: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const deleteMutation = useDeleteGoal();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{goalName}</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowDelete(true)}>
            删除
          </Button>
        </div>
        <Progress value={completionRate * 100} className="mt-4" />
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">当前本金</p>
            <p className="font-medium">¥{currentPrincipal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">目标金额</p>
            <p className="font-medium">¥{targetAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">剩余金额</p>
            <p className="font-medium">¥{remainingAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">月度建议投入</p>
            <p className="font-medium">¥{monthlyRequired.toLocaleString()}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          完成度: {(completionRate * 100).toFixed(1)}%
        </p>
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title="删除目标"
          description="确定要删除这个目标吗？此操作无法撤销。"
          confirmLabel="删除"
          onConfirm={() => deleteMutation.mutate(id)}
          loading={deleteMutation.isPending}
        />
      </div>

      {allocations && allocations.length > 0 && (
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-base font-semibold">资产配置方案</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">账户</th>
                  <th className="pb-2 pr-4">比例</th>
                  <th className="pb-2 pr-4">资金量</th>
                  <th className="pb-2 pr-4">关键标的</th>
                  <th className="pb-2">角色</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{alloc.name}</td>
                    <td className="py-2 pr-4">{alloc.percentage}%</td>
                    <td className="py-2 pr-4">¥{alloc.targetAmount.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{alloc.assets || "-"}</td>
                    <td className="py-2 text-muted-foreground">{alloc.role || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
