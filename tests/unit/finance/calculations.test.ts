import { describe, expect, it } from "vitest";

import {
  aggregateDuplicateHoldings,
  calculateCostAmount,
  calculateFundExposureAmount,
  calculateGoalCompletion,
  calculateMarketValue,
  calculateMonthlyRequiredContribution,
  calculateProfit,
  calculateProfitRate,
} from "@/lib/finance/calculations";

describe("finance calculations", () => {
  it("calculates market value", () => {
    expect(calculateMarketValue({ quantity: 10, currentPrice: 25 })).toBe(250);
  });

  it("calculates cost amount", () => {
    expect(calculateCostAmount({ quantity: 10, avgCost: 15 })).toBe(150);
  });

  it("calculates profit", () => {
    expect(calculateProfit({ marketValue: 250, costAmount: 150 })).toBe(100);
  });

  it("calculates profit rate", () => {
    expect(calculateProfitRate({ profit: 100, costAmount: 400 })).toBe(0.25);
  });

  it("returns zero profit rate when cost is zero", () => {
    expect(calculateProfitRate({ profit: 100, costAmount: 0 })).toBe(0);
  });

  it("calculates goal completion and caps display rate at 1", () => {
    expect(calculateGoalCompletion({ currentPrincipal: 120000, targetAmount: 100000 })).toEqual({
      rawRate: 1.2,
      displayRate: 1,
      remainingAmount: 0,
    });
  });

  it("calculates monthly required contribution", () => {
    expect(
      calculateMonthlyRequiredContribution({
        remainingAmount: 12000,
        currentDate: new Date("2026-05-24T00:00:00.000Z"),
        targetDate: new Date("2027-05-24T00:00:00.000Z"),
      }),
    ).toBe(1000);
  });

  it("calculates one-layer fund exposure amount", () => {
    expect(calculateFundExposureAmount({ fundMarketValue: 100000, holdingWeight: 0.08 })).toBe(8000);
  });

  it("aggregates duplicate underlying holdings", () => {
    expect(
      aggregateDuplicateHoldings([
        {
          holdingSymbol: "0700.HK",
          holdingName: "Tencent",
          holdingMarket: "HK",
          industry: "Internet",
          exposureAmount: 8000,
          sourceFundSymbols: ["FUND_A"],
        },
        {
          holdingSymbol: "0700.HK",
          holdingName: "Tencent",
          holdingMarket: "HK",
          industry: "Internet",
          exposureAmount: 5000,
          sourceFundSymbols: ["FUND_B"],
        },
      ]),
    ).toEqual([
      {
        holdingSymbol: "0700.HK",
        holdingName: "Tencent",
        holdingMarket: "HK",
        industry: "Internet",
        exposureAmount: 13000,
        sourceFundSymbols: ["FUND_A", "FUND_B"],
      },
    ]);
  });
});
