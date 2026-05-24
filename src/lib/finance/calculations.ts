type QuantityPriceInput = {
  quantity: number;
  currentPrice: number;
};

type QuantityCostInput = {
  quantity: number;
  avgCost: number;
};

type ProfitInput = {
  marketValue: number;
  costAmount: number;
};

type ProfitRateInput = {
  profit: number;
  costAmount: number;
};

type GoalCompletionInput = {
  currentPrincipal: number;
  targetAmount: number;
};

type MonthlyContributionInput = {
  remainingAmount: number;
  currentDate: Date;
  targetDate: Date;
};

type FundExposureInput = {
  fundMarketValue: number;
  holdingWeight: number;
};

export type ExposureHolding = {
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: string;
  industry: string;
  exposureAmount: number;
  sourceFundSymbols: string[];
};

export function calculateMarketValue(input: QuantityPriceInput) {
  return roundMoney(input.quantity * input.currentPrice);
}

export function calculateCostAmount(input: QuantityCostInput) {
  return roundMoney(input.quantity * input.avgCost);
}

export function calculateProfit(input: ProfitInput) {
  return roundMoney(input.marketValue - input.costAmount);
}

export function calculateProfitRate(input: ProfitRateInput) {
  if (input.costAmount <= 0) {
    return 0;
  }

  return roundRate(input.profit / input.costAmount);
}

export function calculateGoalCompletion(input: GoalCompletionInput) {
  if (input.targetAmount <= 0) {
    return {
      rawRate: 0,
      displayRate: 0,
      remainingAmount: 0,
    };
  }

  const rawRate = roundRate(input.currentPrincipal / input.targetAmount);
  return {
    rawRate,
    displayRate: Math.min(rawRate, 1),
    remainingAmount: roundMoney(Math.max(input.targetAmount - input.currentPrincipal, 0)),
  };
}

export function calculateMonthlyRequiredContribution(input: MonthlyContributionInput) {
  if (input.remainingAmount <= 0) {
    return 0;
  }

  const months = monthsBetween(input.currentDate, input.targetDate);
  if (months <= 0) {
    return roundMoney(input.remainingAmount);
  }

  return roundMoney(input.remainingAmount / months);
}

export function calculateFundExposureAmount(input: FundExposureInput) {
  return roundMoney(input.fundMarketValue * input.holdingWeight);
}

export function aggregateDuplicateHoldings(holdings: ExposureHolding[]) {
  const grouped = new Map<string, ExposureHolding>();

  for (const holding of holdings) {
    const existing = grouped.get(holding.holdingSymbol);
    if (!existing) {
      grouped.set(holding.holdingSymbol, {
        ...holding,
        sourceFundSymbols: [...holding.sourceFundSymbols],
      });
      continue;
    }

    existing.exposureAmount = roundMoney(existing.exposureAmount + holding.exposureAmount);
    existing.sourceFundSymbols = Array.from(
      new Set([...existing.sourceFundSymbols, ...holding.sourceFundSymbols]),
    );
  }

  return Array.from(grouped.values());
}

function monthsBetween(currentDate: Date, targetDate: Date) {
  const yearDiff = targetDate.getUTCFullYear() - currentDate.getUTCFullYear();
  const monthDiff = targetDate.getUTCMonth() - currentDate.getUTCMonth();
  const baseMonths = yearDiff * 12 + monthDiff;
  return targetDate.getUTCDate() >= currentDate.getUTCDate() ? baseMonths : baseMonths - 1;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}
