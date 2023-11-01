import type { Config } from "drizzle-kit";
import env from "./src/env.mjs";

const config: Config = {
  schema: "./drizzle/schema.ts",
  driver: "turso",
  /// @ts-expect-error 
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN
  },
  out: "drizzle/migrations"
}

export default config;