import { pgTable, serial, text, integer, timestamp, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const students = pgTable("unit3_students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classroom: text("classroom").notNull(),
  accessCode: text("access_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("unit3_student_identity").on(t.name, t.classroom)]);

export const attempts = pgTable("unit3_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  score: integer("score").default(0).notNull(),
  status: text("status").default("in_progress").notNull(),
});

export const answers = pgTable("unit3_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => attempts.id),
  question: integer("question").notNull(),
  response: jsonb("response").notNull(),
  score: integer("score").default(0).notNull(),
  correct: boolean("correct").default(false).notNull(),
  needsReview: boolean("needs_review").default(false).notNull(),
  feedback: text("feedback").default("").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("unit3_answer_once").on(t.attemptId, t.question)]);
