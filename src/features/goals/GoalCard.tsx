"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { useDeleteGoal } from "./hooks";

type Props = {
  id: string;
  goalName: string;
  targetAmount: number;
  completionRate: number;
  remainingAmount: number;
  monthlyRequired: number;
  currentPrincipal: number;
};

export function GoalCard({ id, goalName, targetAmount, completionRate, remainingAmount, monthlyRequired, currentPrincipal }: Props) {
  const deleteMutation = useDeleteGoal();

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{goalName}</h2>
        <Button variant="ghost" size="sm" onClick={() => { if (confirm("确定删除该目标？")) deleteMutation.mutate(id); }}>删除</Button>
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
      <p className="mt-3 text-xs text-muted-foreground">完成度: {(completionRate * 100).toFixed(1)}%</p>
    </div>
  );
}
