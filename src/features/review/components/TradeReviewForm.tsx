"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";

import { useCreateReview, useUpdateReview } from "../hooks";
import type { TradeReview } from "../types";
import {
  TRADE_GRADE_LABELS,
  STRATEGY_TYPE_LABELS,
  ERROR_TYPE_LABELS,
  MARKET_ENV_LABELS,
  EXECUTION_QUALITY_LABELS,
  PRE_EMOTION_LABELS,
  POST_EMOTION_LABELS,
} from "../types";

type Transaction = {
  id: string;
  assetName: string;
  symbol: string | null;
  transactionType: string;
  transactionTime: string;
  price: number;
  quantity: number;
};

type TransactionList = { items: Transaction[]; total: number };

type Props = {
  review?: TradeReview;
  transactionId?: string;
};

// PLACEHOLDER-FORM-BODY

type FormState = {
  transactionId: string;
  // Step 1 — context
  marketEnvironment: string;
  keyLevels: string;
  newsEvents: string;
  sectorContext: string;
  // Step 2 — execution & risk
  followedPlan: boolean;
  entryQuality: string;
  exitQuality: string;
  chasedPrice: boolean;
  movedStopLoss: boolean;
  addedPosition: boolean;
  mae: string;
  mfe: string;
  riskPerTrade: string;
  accountRiskPct: string;
  dailyRiskTotal: string;
  rMultiple: string;
  // Step 3 — scoring & attribution
  scoreOpportunity: number;
  scorePlanning: number;
  scoreRiskControl: number;
  scoreDiscipline: number;
  scorePsychology: number;
  errorType: string;
  strategyType: string;
  preTradeEmotion: string;
  postTradeEmotion: string;
  profitSource: string;
  lossReason: string;
  hindsightAction: string;
  nextAction: string;
  isRepeatable: boolean;
  exposesPattern: boolean;
  includeInSample: boolean;
  notes: string;
};

function initialState(review?: TradeReview, transactionId?: string): FormState {
  return {
    transactionId: review?.transactionId ?? transactionId ?? "",
    marketEnvironment: review?.marketEnvironment ?? "",
    keyLevels: "",
    newsEvents: "",
    sectorContext: "",
    followedPlan: review?.followedPlan ?? true,
    entryQuality: review?.entryQuality ?? "",
    exitQuality: review?.exitQuality ?? "",
    chasedPrice: review?.chasedPrice ?? false,
    movedStopLoss: review?.movedStopLoss ?? false,
    addedPosition: review?.addedPosition ?? false,
    mae: review?.mae != null ? String(review.mae) : "",
    mfe: review?.mfe != null ? String(review.mfe) : "",
    riskPerTrade: review?.riskPerTrade != null ? String(review.riskPerTrade) : "",
    accountRiskPct: review?.accountRiskPct != null ? String(review.accountRiskPct) : "",
    dailyRiskTotal: review?.dailyRiskTotal != null ? String(review.dailyRiskTotal) : "",
    rMultiple: review?.rMultiple != null ? String(review.rMultiple) : "",
    scoreOpportunity: review?.scoreOpportunity ?? 0,
    scorePlanning: review?.scorePlanning ?? 0,
    scoreRiskControl: review?.scoreRiskControl ?? 0,
    scoreDiscipline: review?.scoreDiscipline ?? 0,
    scorePsychology: review?.scorePsychology ?? 0,
    errorType: review?.errorType ?? "none",
    strategyType: review?.strategyType ?? "",
    preTradeEmotion: review?.preTradeEmotion ?? "",
    postTradeEmotion: review?.postTradeEmotion ?? "",
    profitSource: review?.profitSource ?? "",
    lossReason: review?.lossReason ?? "",
    hindsightAction: review?.hindsightAction ?? "",
    nextAction: review?.nextAction ?? "",
    isRepeatable: review?.isRepeatable ?? false,
    exposesPattern: review?.exposesPattern ?? false,
    includeInSample: review?.includeInSample ?? true,
    notes: review?.notes ?? "",
  };
}

function deriveGrade(total: number): "A" | "B" | "C" {
  if (total >= 80) return "A";
  if (total >= 60) return "B";
  return "C";
}

const STEPS = ["交易背景", "执行与风控", "评分与归因"] as const;

export function TradeReviewForm({ review, transactionId }: Props) {
  const router = useRouter();
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const isEdit = !!review;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(review, transactionId));

  if (!loaded) {
    apiFetch<TransactionList>("/api/transactions?pageSize=100")
      .then((res) => setTransactions(res.items))
      .finally(() => setLoaded(true));
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const totalScore =
    form.scoreOpportunity +
    form.scorePlanning +
    form.scoreRiskControl +
    form.scoreDiscipline +
    form.scorePsychology;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const num = (v: string) => (v.trim() !== "" ? Number(v) : undefined);
    const payload: Record<string, unknown> = {
      transactionId: form.transactionId || undefined,
      marketEnvironment: form.marketEnvironment || undefined,
      keyLevels: form.keyLevels || undefined,
      newsEvents: form.newsEvents || undefined,
      sectorContext: form.sectorContext || undefined,
      followedPlan: form.followedPlan,
      entryQuality: form.entryQuality || undefined,
      exitQuality: form.exitQuality || undefined,
      chasedPrice: form.chasedPrice,
      movedStopLoss: form.movedStopLoss,
      addedPosition: form.addedPosition,
      mae: num(form.mae),
      mfe: num(form.mfe),
      riskPerTrade: num(form.riskPerTrade),
      accountRiskPct: num(form.accountRiskPct),
      dailyRiskTotal: num(form.dailyRiskTotal),
      rMultiple: num(form.rMultiple),
      scoreOpportunity: form.scoreOpportunity,
      scorePlanning: form.scorePlanning,
      scoreRiskControl: form.scoreRiskControl,
      scoreDiscipline: form.scoreDiscipline,
      scorePsychology: form.scorePsychology,
      errorType: form.errorType || undefined,
      strategyType: form.strategyType || undefined,
      preTradeEmotion: form.preTradeEmotion || undefined,
      postTradeEmotion: form.postTradeEmotion || undefined,
      profitSource: form.profitSource || undefined,
      lossReason: form.lossReason || undefined,
      hindsightAction: form.hindsightAction || undefined,
      nextAction: form.nextAction || undefined,
      isRepeatable: form.isRepeatable,
      exposesPattern: form.exposesPattern,
      includeInSample: form.includeInSample,
      notes: form.notes || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: review.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  // PLACEHOLDER-RENDER
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* 步骤指示 */}
      <ol className="flex items-center gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? "font-medium" : "text-muted-foreground"}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 text-muted-foreground">›</span>}
          </li>
        ))}
      </ol>

      {/* Step 1 — 交易背景 */}
      {step === 0 && (
        <div className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label>关联交易</Label>
              <select
                className="w-full rounded border px-3 py-2"
                value={form.transactionId}
                onChange={(e) => set("transactionId", e.target.value)}
                required
              >
                <option value="">选择交易</option>
                {transactions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.assetName} - {t.transactionType === "buy" ? "买入" : "卖出"} {t.quantity}@{t.price} ({new Date(t.transactionTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label>市场环境</Label>
            <select
              className="w-full rounded border px-3 py-2"
              value={form.marketEnvironment}
              onChange={(e) => set("marketEnvironment", e.target.value)}
            >
              <option value="">选择市场环境</option>
              {Object.entries(MARKET_ENV_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>关键价位</Label>
            <Textarea value={form.keyLevels} onChange={(e) => set("keyLevels", e.target.value)} rows={2} placeholder="支撑/阻力、入场价、止损位等" />
          </div>
          <div className="space-y-2">
            <Label>消息事件</Label>
            <Textarea value={form.newsEvents} onChange={(e) => set("newsEvents", e.target.value)} rows={2} placeholder="影响本次交易的新闻或事件" />
          </div>
          <div className="space-y-2">
            <Label>板块/大盘环境</Label>
            <Textarea value={form.sectorContext} onChange={(e) => set("sectorContext", e.target.value)} rows={2} placeholder="所属板块与大盘走势" />
          </div>
        </div>
      )}

      {/* PLACEHOLDER-STEP2 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>是否按计划执行</Label>
            <select
              className="w-full rounded border px-3 py-2"
              value={form.followedPlan ? "yes" : "no"}
              onChange={(e) => set("followedPlan", e.target.value === "yes")}
            >
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>入场质量</Label>
              <select className="w-full rounded border px-3 py-2" value={form.entryQuality} onChange={(e) => set("entryQuality", e.target.value)}>
                <option value="">未评价</option>
                {Object.entries(EXECUTION_QUALITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>出场质量</Label>
              <select className="w-full rounded border px-3 py-2" value={form.exitQuality} onChange={(e) => set("exitQuality", e.target.value)}>
                <option value="">未评价</option>
                {Object.entries(EXECUTION_QUALITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.chasedPrice} onChange={(e) => set("chasedPrice", e.target.checked)} />
              追单
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.movedStopLoss} onChange={(e) => set("movedStopLoss", e.target.checked)} />
              移动止损
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.addedPosition} onChange={(e) => set("addedPosition", e.target.checked)} />
              加仓
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>最大浮亏 MAE</Label>
              <Input type="number" step="0.0001" value={form.mae} onChange={(e) => set("mae", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>最大浮盈 MFE</Label>
              <Input type="number" step="0.0001" value={form.mfe} onChange={(e) => set("mfe", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>单笔风险金额</Label>
              <Input type="number" step="0.01" value={form.riskPerTrade} onChange={(e) => set("riskPerTrade", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>账户风险占比 %</Label>
              <Input type="number" step="0.01" value={form.accountRiskPct} onChange={(e) => set("accountRiskPct", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>当日累计风险</Label>
              <Input type="number" step="0.01" value={form.dailyRiskTotal} onChange={(e) => set("dailyRiskTotal", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>R 倍数</Label>
              <Input type="number" step="0.01" placeholder="如 2.5 / -1" value={form.rMultiple} onChange={(e) => set("rMultiple", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* PLACEHOLDER-STEP3 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-3 rounded-md border p-4">
            <ScoreSlider label="交易机会" max={25} value={form.scoreOpportunity} onChange={(v) => set("scoreOpportunity", v)} />
            <ScoreSlider label="交易计划" max={25} value={form.scorePlanning} onChange={(v) => set("scorePlanning", v)} />
            <ScoreSlider label="风险控制" max={20} value={form.scoreRiskControl} onChange={(v) => set("scoreRiskControl", v)} />
            <ScoreSlider label="执行纪律" max={20} value={form.scoreDiscipline} onChange={(v) => set("scoreDiscipline", v)} />
            <ScoreSlider label="心理状态" max={10} value={form.scorePsychology} onChange={(v) => set("scorePsychology", v)} />
            <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
              <span>总分</span>
              <span>
                {totalScore}/100 · {TRADE_GRADE_LABELS[deriveGrade(totalScore)]}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>策略类型</Label>
              <select className="w-full rounded border px-3 py-2" value={form.strategyType} onChange={(e) => set("strategyType", e.target.value)}>
                <option value="">选择策略</option>
                {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>错误类型</Label>
              <select className="w-full rounded border px-3 py-2" value={form.errorType} onChange={(e) => set("errorType", e.target.value)}>
                {Object.entries(ERROR_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>交易前情绪</Label>
              <select className="w-full rounded border px-3 py-2" value={form.preTradeEmotion} onChange={(e) => set("preTradeEmotion", e.target.value)}>
                <option value="">未记录</option>
                {Object.entries(PRE_EMOTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>交易后情绪</Label>
              <select className="w-full rounded border px-3 py-2" value={form.postTradeEmotion} onChange={(e) => set("postTradeEmotion", e.target.value)}>
                <option value="">未记录</option>
                {Object.entries(POST_EMOTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>盈利来源</Label>
            <Textarea value={form.profitSource} onChange={(e) => set("profitSource", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>亏损原因</Label>
            <Textarea value={form.lossReason} onChange={(e) => set("lossReason", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>如果重来一次</Label>
            <Textarea value={form.hindsightAction} onChange={(e) => set("hindsightAction", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>下一步行动</Label>
            <Textarea value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} rows={2} />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isRepeatable} onChange={(e) => set("isRepeatable", e.target.checked)} />
              可复制
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.exposesPattern} onChange={(e) => set("exposesPattern", e.target.checked)} />
              暴露重复性错误
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.includeInSample} onChange={(e) => set("includeInSample", e.target.checked)} />
              纳入统计样本
            </label>
          </div>
          <div className="space-y-2">
            <Label>复盘笔记</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* 导航 */}
      <div className="flex gap-2">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            上一步
          </Button>
        )}
        {step < STEPS.length - 1 && (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            下一步
          </Button>
        )}
        {step === STEPS.length - 1 && (
          <Button type="submit" disabled={isPending}>
            {isPending ? "提交中..." : isEdit ? "更新复盘" : "创建复盘"}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}

function ScoreSlider({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="text-muted-foreground">
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

