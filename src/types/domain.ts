export type AssetType = "stock" | "fund" | "crypto" | "cash";
export type Market = "CN" | "HK" | "US" | "CRYPTO" | "CASH";
export type Currency = "CNY" | "USD" | "HKD" | "USDT";

export type TransactionType =
  | "buy"
  | "sell"
  | "add"
  | "reduce"
  | "fixed_invest"
  | "transfer_in"
  | "transfer_out";

export type ApiErrorCode = 400 | 401 | 403 | 404 | 409 | 500 | "WRONG_PASSWORD";
