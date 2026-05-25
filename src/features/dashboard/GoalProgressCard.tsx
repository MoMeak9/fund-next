"use client";

import { Progress } from "@/components/ui/progress";

type Props = {
  goalName: string;
  targetAmount: number;
  completionRate: number;
  remainingAmount: number;
  monthlyRequired: number;
};

export function GoalProgressCard({ goalName, targetAmount, completionRate, remainingAmount, monthlyRequired }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-muted-foreground">目标进度</h3>
      <p className="mt-1 font-semibold">{goalName}</p>
      <Progress value={completionRate * 100} className="mt-3" />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{(completionRate * 100).toFixed(1)}%</span>
        <span>目标: ¥{targetAmount.toLocaleString()}</span>
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <span>剩余: ¥{remainingAmount.toLocaleString()}</span>
        <span>月度建议: ¥{monthlyRequired.toLocaleString()}</span>
      </div>
    </div>
  );
}
