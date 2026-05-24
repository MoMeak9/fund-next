import { MarketDataError } from "../errors";
import type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "../types";

type OpenApiProviderOptions = {
  apiKey: string;
  baseUrl: string;
};

export class OpenApiMarketDataProvider implements MarketDataProvider {
  constructor(private readonly options: OpenApiProviderOptions) {}

  async getQuote(_request: QuoteRequest): Promise<Quote | null> {
    void _request;
    this.assertConfigured();
    throw new MarketDataError("Open API quote integration is not implemented", "request_failed");
  }

  async getQuotes(requests: QuoteRequest[]): Promise<Quote[]> {
    const results = await Promise.all(requests.map((request) => this.getQuote(request)));
    return results.filter((quote): quote is Quote => quote !== null);
  }

  async getFundHoldings(_fundSymbol: string): Promise<FundHolding[]> {
    void _fundSymbol;
    this.assertConfigured();
    throw new MarketDataError("Open API fund holdings integration is not implemented", "request_failed");
  }

  async searchAssets(_keyword: string): Promise<AssetSearchResult[]> {
    void _keyword;
    this.assertConfigured();
    throw new MarketDataError("Open API asset search integration is not implemented", "request_failed");
  }

  private assertConfigured() {
    if (!this.options.apiKey || !this.options.baseUrl) {
      throw new MarketDataError("Market data provider credentials are missing", "provider_not_configured");
    }
  }
}
