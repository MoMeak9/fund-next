// Pure R-series metrics, shared by the indicator dashboard and strategy stats.

// Longest run of consecutive losing trades (rMultiple < 0). Nulls break a streak.
export function maxConsecutiveLoss(rSeries: (number | null)[]): number {
  let max = 0;
  let cur = 0;
  for (const r of rSeries) {
    if (r != null && r < 0) {
      cur += 1;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  }
  return max;
}

// Most negative point of the running cumulative-R curve (0 if never underwater).
export function maxDrawdownR(rSeries: (number | null)[]): number {
  let cumulative = 0;
  let peak = 0;
  let maxDd = 0;
  for (const r of rSeries) {
    if (r == null) continue;
    cumulative += r;
    peak = Math.max(peak, cumulative);
    maxDd = Math.min(maxDd, cumulative - peak);
  }
  return maxDd;
}
