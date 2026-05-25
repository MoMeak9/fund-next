"use client";

import { GoalCard } from "@/features/goals/GoalCard";
import { GoalForm } from "@/features/goals/GoalForm";
import { useActiveGoal } from "@/features/goals/hooks";

export default function GoalsPage() {
  const { data: activeGoal, isLoading } = useActiveGoal();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">目标规划</h1>
      {activeGoal ? (
        <GoalCard
          id={activeGoal.id}
          goalName={activeGoal.goalName}
          targetAmount={activeGoal.targetAmount}
          completionRate={activeGoal.completionRate}
          remainingAmount={activeGoal.remainingAmount}
          monthlyRequired={activeGoal.monthlyRequired}
          currentPrincipal={activeGoal.currentPrincipal}
        />
      ) : (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">暂无进行中的目标，创建一个开始追踪。</p>
          <GoalForm />
        </div>
      )}
    </section>
  );
}
