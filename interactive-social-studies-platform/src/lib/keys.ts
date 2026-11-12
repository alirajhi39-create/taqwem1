import { randomBytes } from "node:crypto";
import { pool } from "@/db";
import { ensureSchema } from "@/db/ensure";

export type SavedKey = { id: string; role: "student" | "teacher"; studentId: number | null; name: string | null };

export async function createKey(data: { role: "student" | "teacher"; studentId?: number; name?: string }) {
  await ensureSchema();
  const id = randomBytes(9).toString("base64url");
  await pool.query("INSERT INTO unit3_keys (id, role, student_id, student_name, expires_at) VALUES ($1, $2, $3, $4, now() + interval '30 days')", [id, data.role, data.studentId ?? null, data.name ?? null]);
  return id;
}

export async function readKey(id: string): Promise<SavedKey | null> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
  await ensureSchema();
  const result = await pool.query("SELECT id, role, student_id, student_name FROM unit3_keys WHERE id = $1 AND expires_at > now()", [id]);
  const row = result.rows[0];
  if (!row || (row.role !== "student" && row.role !== "teacher")) return null;
  return { id: String(row.id), role: row.role, studentId: row.student_id == null ? null : Number(row.student_id), name: row.student_name == null ? null : String(row.student_name) };
}
