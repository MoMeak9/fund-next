import type { AssetType, Currency, Market } from "@/types/domain";

export type Quote = {
  symbol: string;
  assetName: string;
  assetType: AssetType;
  market: Market;
  currency: Currency;
  price: number;
  priceTime: string;
  source: string;
};

export type AssetSearchResult = {
  symbol: string;
  assetName: string;
  assetType: AssetType;
  market: Market;
  currency: Currency;
};

export type FundHolding = {
  fundSymbol: string;
  fundName: string;
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: Market;
  industry: string;
  weight: number;
  reportDate: string;
};

export type QuoteRequest = {
  symbol: string;
  market: Market;
};

export interface MarketDataProvider {
  getQuote(request: QuoteRequest): Promise<Quote | null>;
  getQuotes(requests: QuoteRequest[]): Promise<Quote[]>;
  getFundHoldings(fundSymbol: string): Promise<FundHolding[]>;
  searchAssets(keyword: string): Promise<AssetSearchResult[]>;
}
