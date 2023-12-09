import { env } from "@/env";
import { type Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  driver: "mysql2",
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
  tablesFilter: ["taskflow_*"],
} satisfies Config;
