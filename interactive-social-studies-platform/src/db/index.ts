import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

let hostname = "";
try {
  hostname = new URL(databaseUrl).hostname;
} catch {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL");
}

export const isNeonDatabase = /(^|\.)neon\.tech$/.test(hostname) || hostname.includes(".neon.");
export const databaseProvider = isNeonDatabase ? "neon" : "postgresql";

const poolMax = Number(process.env.DB_POOL_MAX || (isNeonDatabase ? 2 : 10));
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: Number.isFinite(poolMax) && poolMax > 0 ? Math.min(poolMax, 20) : 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
    ...(isNeonDatabase ? { ssl: { rejectUnauthorized: true } } : {}),
  });

pool.on("error", (error) => {
  console.error("Database pool error:", error.message);
});

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
