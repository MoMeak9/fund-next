import type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "../types";

const mockQuotes: Quote[] = [
  {
    symbol: "AAPL",
    assetName: "Apple Inc.",
    assetType: "stock",
    market: "US",
    currency: "USD",
    price: 190,
    priceTime: "2026-05-24T00:00:00.000Z",
    source: "mock",
  },
  {
    symbol: "BTC",
    assetName: "Bitcoin",
    assetType: "crypto",
    market: "CRYPTO",
    currency: "USDT",
    price: 68000,
    priceTime: "2026-05-24T00:00:00.000Z",
    source: "mock",
  },
];

const mockFundHoldings: FundHolding[] = [
  {
    fundSymbol: "FUND001",
    fundName: "Mock Growth Fund",
    holdingSymbol: "AAPL",
    holdingName: "Apple Inc.",
    holdingMarket: "US",
    industry: "Technology",
    weight: 0.08,
    reportDate: "2026-03-31",
  },
];

export class MockMarketDataProvider implements MarketDataProvider {
  async getQuote(request: QuoteRequest): Promise<Quote | null> {
    return mockQuotes.find((quote) => quote.symbol === request.symbol && quote.market === request.market) ?? null;
  }

  async getQuotes(requests: QuoteRequest[]): Promise<Quote[]> {
    const results = await Promise.all(requests.map((request) => this.getQuote(request)));
    return results.filter((quote): quote is Quote => quote !== null);
  }

  async getFundHoldings(fundSymbol: string): Promise<FundHolding[]> {
    return mockFundHoldings.filter((holding) => holding.fundSymbol === fundSymbol);
  }

  async searchAssets(keyword: string): Promise<AssetSearchResult[]> {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return [];
    }

    return mockQuotes
      .filter(
        (quote) =>
          quote.symbol.toLowerCase().includes(normalizedKeyword) ||
          quote.assetName.toLowerCase().includes(normalizedKeyword),
      )
      .map(({ symbol, assetName, assetType, market, currency }) => ({
        symbol,
        assetName,
        assetType,
        market,
        currency,
      }));
  }
}
