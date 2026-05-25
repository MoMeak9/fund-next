"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAddWatchlist, useSearchAssets } from "./hooks";

export function AddWatchlistDialog() {
  const [keyword, setKeyword] = useState("");
  const { data: results } = useSearchAssets(keyword);
  const addMutation = useAddWatchlist();

  return (
    <div className="space-y-3">
      <Input placeholder="搜索资产代码或名称..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {results && results.length > 0 && (
        <ul className="space-y-1 rounded border p-2">
          {results.map((r) => (
            <li key={r.symbol} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted">
              <span>{r.assetName} ({r.symbol}) - {r.market}</span>
              <Button size="sm" variant="ghost" onClick={() => addMutation.mutate(r)}>添加</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
