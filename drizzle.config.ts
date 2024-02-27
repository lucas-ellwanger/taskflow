import "dotenv/config";

import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.NEON_DATABASE_URL!,
  },
  tablesFilter: ["taskflow_*"],
} satisfies Config;
