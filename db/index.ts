import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema";

// NOTE: We use a direct IP and endpoint ID for local development because 
// some environments (like the agent's) have DNS/timeout issues with Neon's hostname.
const pool = new Pool({
  host: "34.206.177.121",
  port: 5432,
  user: "neondb_owner",
  password: "***REDACTED***",
  database: "neondb",
  ssl: { rejectUnauthorized: false },
  options: "endpoint=ep-orange-moon-am8wby3h-pooler"
});

export const db = drizzle(pool, { schema });
