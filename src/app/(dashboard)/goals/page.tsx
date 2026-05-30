"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { GoalCard } from "@/features/goals/GoalCard";
import { GoalForm } from "@/features/goals/GoalForm";
import { useActiveGoal } from "@/features/goals/hooks";

export default function GoalsPage() {
  const { data: activeGoal, isLoading } = useActiveGoal();

  if (isLoading) return <CardGridSkeleton count={3} />;

  return (
    <section>
      <PageHeader title="目标规划" />
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
