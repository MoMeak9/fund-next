import { getServerEnv } from "@/lib/env/server";

import { MockMarketDataProvider } from "./providers/mock";
import { OpenApiMarketDataProvider } from "./providers/open-api";
import type { MarketDataProvider, QuoteRequest } from "./types";

export function createMarketDataProvider(): MarketDataProvider {
  const env = getServerEnv();

  if (env.MARKET_DATA_PROVIDER === "open-api") {
    return new OpenApiMarketDataProvider({
      apiKey: env.MARKET_DATA_API_KEY,
      baseUrl: env.MARKET_DATA_BASE_URL,
    });
  }

  return new MockMarketDataProvider();
}

export async function getQuote(request: QuoteRequest) {
  return createMarketDataProvider().getQuote(request);
}

export async function getQuotes(requests: QuoteRequest[]) {
  return createMarketDataProvider().getQuotes(requests);
}

export async function getFundHoldings(fundSymbol: string) {
  return createMarketDataProvider().getFundHoldings(fundSymbol);
}

export async function searchAssets(keyword: string) {
  return createMarketDataProvider().searchAssets(keyword);
}

export type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "./types";
export { MarketDataError } from "./errors";
