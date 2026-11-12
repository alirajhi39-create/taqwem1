import { db } from "@/db";
import { answers, attempts, students } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { questionTitles } from "@/lib/quiz";

const classroomNames: Record<string, string> = { "6A": "السادس أ", "6B": "السادس ب", "6C": "السادس ج", "6D": "السادس د", "6E": "السادس هـ", "6F": "السادس و", A: "السادس أ", B: "السادس ب", C: "السادس ج", D: "السادس د", E: "السادس هـ", F: "السادس و" };
export function normalizeClassroom(value: string) { const raw = value.trim(); return classroomNames[raw] || classroomNames[raw.toUpperCase()] || raw; }
export async function findOrCreateStudent(name: string, classroom: string) {
  const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 100);
  const cleanClass = normalizeClassroom(classroom).slice(0, 40);
  if (cleanName.length < 2 || !cleanClass) return null;
  let [student] = await db.select().from(students).where(and(eq(students.name, cleanName), eq(students.classroom, cleanClass))).limit(1);
  if (!student) [student] = await db.insert(students).values({ name: cleanName, classroom: cleanClass }).onConflictDoNothing().returning();
  if (!student) [student] = await db.select().from(students).where(and(eq(students.name, cleanName), eq(students.classroom, cleanClass))).limit(1);
  return student || null;
}

export async function studentState(studentId: number, name?: string) {
  const [attempt] = await db.select().from(attempts).where(eq(attempts.studentId, studentId)).orderBy(desc(attempts.id)).limit(1);
  const responses = attempt ? await db.select().from(answers).where(eq(answers.attemptId, attempt.id)) : [];
  return { user: { name: name || "" }, attempt: attempt || null, answers: responses };
}

export async function startAttempt(studentId: number, name?: string) {
  const [latest] = await db.select().from(attempts).where(eq(attempts.studentId, studentId)).orderBy(desc(attempts.id)).limit(1);
  if (latest?.status !== "in_progress") await db.insert(attempts).values({ studentId });
  return studentState(studentId, name);
}

export async function teacherDashboard() {
  const records = await db.select({ attempt: attempts, student: students }).from(attempts).innerJoin(students, eq(attempts.studentId, students.id)).orderBy(desc(attempts.id));
  const responses = await db.select().from(answers);
  const data = records.map((row) => ({ ...row.attempt, student: row.student, answers: responses.filter((answer) => answer.attemptId === row.attempt.id) }));
  const completed = data.filter((row) => row.status === "completed");
  const difficulty = questionTitles.map((title, index) => ({ title, average: completed.length ? Math.round(completed.reduce((sum, row) => sum + (row.answers.find((answer) => answer.question === index + 1)?.score || 0), 0) / completed.length * 10) : 0 })).sort((a, b) => a.average - b.average);
  return { records: data, average: completed.length ? Math.round(completed.reduce((sum, row) => sum + row.score, 0) / completed.length / 90 * 100) : 0, difficulty };
}

export function resultsCsv(data: Awaited<ReturnType<typeof teacherDashboard>>) {
  const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return "\uFEFF" + ["اسم الطالب,الفصل,التاريخ,الدرجة,النسبة,الحالة", ...data.records.map((row) => [row.student.name, row.student.classroom, new Date(row.startedAt).toISOString(), row.score, `${Math.round(row.score / 90 * 100)}%`, row.status === "completed" ? "مكتمل" : "جارٍ"].map(esc).join(","))].join("\n");
}
