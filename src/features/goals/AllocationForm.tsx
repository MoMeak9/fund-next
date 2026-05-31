"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AllocationItem = {
  name: string;
  percentage: string;
  targetAmount: string;
  assets: string;
  role: string;
};

const EMPTY_ITEM: AllocationItem = {
  name: "",
  percentage: "",
  targetAmount: "",
  assets: "",
  role: "",
};

const PRESETS = [
  {
    label: "黄金分割 30/30/35/5",
    items: [
      {
        name: "稳健安全垫",
        percentage: "30",
        targetAmount: "",
        assets: "中短债基、固收+",
        role: "防守：确保底仓稳定",
      },
      {
        name: "现金奶牛",
        percentage: "30",
        targetAmount: "",
        assets: "A股/港股红利资产",
        role: "补给：提供现金流",
      },
      {
        name: "全球猎手",
        percentage: "35",
        targetAmount: "",
        assets: "QDII基金（美股科技为主）",
        role: "主力进攻：实现10%+增长",
      },
      {
        name: "黑马彩票",
        percentage: "5",
        targetAmount: "",
        assets: "BTC / ETH",
        role: "奇兵：高波动高回报",
      },
    ],
  },
  {
    label: "经典三分法 40/40/20",
    items: [
      {
        name: "固收稳健",
        percentage: "40",
        targetAmount: "",
        assets: "债券基金、银行理财",
        role: "压舱石",
      },
      {
        name: "权益增长",
        percentage: "40",
        targetAmount: "",
        assets: "指数基金、蓝筹股",
        role: "主力增长",
      },
      {
        name: "另类配置",
        percentage: "20",
        targetAmount: "",
        assets: "黄金、REITs、数字资产",
        role: "分散风险",
      },
    ],
  },
];

type Props = {
  items: AllocationItem[];
  onChange: (items: AllocationItem[]) => void;
  totalAmount: number;
};

export function AllocationForm({ items, onChange, totalAmount }: Props) {
  const [expanded, setExpanded] = useState(items.length > 0);

  function addItem() {
    onChange([...items, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof AllocationItem, value: string) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [field]: value };
      // Auto-calc targetAmount when percentage changes
      if (field === "percentage" && totalAmount > 0) {
        const pct = parseFloat(value) || 0;
        newItem.targetAmount = String(Math.round((totalAmount * pct) / 100));
      }
      return newItem;
    });
    onChange(updated);
  }

  function applyPreset(presetIdx: number) {
    const preset = PRESETS[presetIdx];
    const applied = preset.items.map((item) => ({
      ...item,
      targetAmount:
        totalAmount > 0
          ? String(
              Math.round((totalAmount * parseFloat(item.percentage)) / 100),
            )
          : "",
    }));
    onChange(applied);
    setExpanded(true);
  }

  const totalPct = items.reduce(
    (sum, i) => sum + (parseFloat(i.percentage) || 0),
    0,
  );

  if (!expanded) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          添加资产配置方案
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">资产配置方案</Label>
        <div className="flex gap-2">
          {PRESETS.map((preset, idx) => (
            <Button
              key={idx}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyPreset(idx)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-3">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">账户名称</Label>
            )}
            <Input
              placeholder="例: 稳健安全垫"
              value={item.name}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">比例%</Label>
            )}
            <Input
              type="number"
              placeholder="30"
              value={item.percentage}
              onChange={(e) => updateItem(idx, "percentage", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">目标金额</Label>
            )}
            <Input
              type="number"
              placeholder="金额"
              value={item.targetAmount}
              onChange={(e) => updateItem(idx, "targetAmount", e.target.value)}
            />
          </div>
          <div className="col-span-3">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">关键标的</Label>
            )}
            <Input
              placeholder="中短债基、固收+"
              value={item.assets}
              onChange={(e) => updateItem(idx, "assets", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">角色</Label>
            )}
            <Input
              placeholder="防守"
              value={item.role}
              onChange={(e) => updateItem(idx, "role", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            {idx === 0 && (
              <Label className="text-xs text-muted-foreground">&nbsp;</Label>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          添加配置项
        </Button>
        <span
          className={`text-sm ${Math.abs(totalPct - 100) > 0.01 && items.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
        >
          合计: {totalPct.toFixed(1)}%
          {Math.abs(totalPct - 100) > 0.01 &&
            items.length > 0 &&
            " (需等于100%)"}
        </span>
      </div>
    </div>
  );
}
