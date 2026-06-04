"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCompleteAction } from "../hooks";
import type { ReviewAction } from "../types";
import { ACTION_STATUS_LABELS, REVIEW_SOURCE_LABELS } from "../types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "secondary",
  completed: "default",
  failed: "destructive",
  cancelled: "secondary",
};

export function ActionItemList({ actions }: { actions: ReviewAction[] }) {
  const complete = useCompleteAction();
  const [resultFor, setResultFor] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");

  if (actions.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">暂无行动项</p>;
  }

  return (
    <div className="space-y-3">
      {actions.map((a) => (
        <Card key={a.id}>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{REVIEW_SOURCE_LABELS[a.sourceType] ?? a.sourceType}</span>
              <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"}>{ACTION_STATUS_LABELS[a.status] ?? a.status}</Badge>
            </div>
            <p className="font-medium">问题：{a.problem}</p>
            <p className="text-sm">规则：{a.rule}</p>
            {a.metric && <p className="text-sm text-muted-foreground">衡量：{a.metric}</p>}
            {a.result && <p className="text-sm text-muted-foreground">结果：{a.result}</p>}
            {a.status === "active" && (
              <div className="pt-2">
                {resultFor === a.id ? (
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      placeholder="完成结果"
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                    />
                    <Button
                      size="sm"
                      disabled={complete.isPending}
                      onClick={() =>
                        complete.mutate(
                          { id: a.id, result: resultText || undefined },
                          { onSuccess: () => { setResultFor(null); setResultText(""); } },
                        )
                      }
                    >
                      确认完成
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setResultFor(null)}>取消</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setResultFor(a.id)}>标记完成</Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
