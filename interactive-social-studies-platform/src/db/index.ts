import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type QueryResult = { rows: Record<string, unknown>[] };
type SqlClient = ReturnType<typeof neon>;

const globalForDb = globalThis as typeof globalThis & {
  __unit3Pool?: Pool;
  __unit3Neon?: SqlClient;
  __unit3Db?: NodePgDatabase;
};

export function databaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.NEON_DATABASE_URL || "").trim();
}

function requireUrl() {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is required");
  return url;
}

export function usesNeon(url = databaseUrl()) {
  return /neon\.tech|neon\.database/i.test(url);
}

function neonSql() {
  const url = requireUrl();
  globalForDb.__unit3Neon ??= neon(url);
  return globalForDb.__unit3Neon;
}

function pgPool() {
  const url = requireUrl();
  globalForDb.__unit3Pool ??= new Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });
  return globalForDb.__unit3Pool;
}

export async function query(text: string, params: unknown[] = []): Promise<QueryResult> {
  if (usesNeon()) {
    const rows = await neonSql().query(text, params);
    return { rows: (Array.isArray(rows) ? rows : []) as Record<string, unknown>[] };
  }
  const result = await pgPool().query(text, params);
  return { rows: result.rows as Record<string, unknown>[] };
}

export const pool = {
  query: (text: string, params?: unknown[]) => query(text, params ?? []),
};

function createDb() {
  return (usesNeon() ? drizzleNeon(neonSql()) : drizzlePg(pgPool())) as NodePgDatabase;
}

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, property, receiver) {
    globalForDb.__unit3Db ??= createDb();
    const value = Reflect.get(globalForDb.__unit3Db, property, receiver);
    return typeof value === "function" ? value.bind(globalForDb.__unit3Db) : value;
  },
});
