export class MarketDataError extends Error {
  constructor(
    message: string,
    readonly code: "provider_not_configured" | "request_failed" | "invalid_response",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}
