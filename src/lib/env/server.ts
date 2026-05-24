import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  MARKET_DATA_PROVIDER: z.enum(["mock", "open-api"]).default("mock"),
  MARKET_DATA_API_KEY: z.string().optional().default(""),
  MARKET_DATA_BASE_URL: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
