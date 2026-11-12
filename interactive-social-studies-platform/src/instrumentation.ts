export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { databaseUrl } = await import("@/db");
  if (!databaseUrl()) return;
  const { ensureSchema } = await import("@/db/ensure");
  await ensureSchema();
}
