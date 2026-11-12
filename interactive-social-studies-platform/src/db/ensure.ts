import { query } from "@/db";

const statements = [
  `CREATE TABLE IF NOT EXISTS unit3_students (
    id serial PRIMARY KEY,
    name text NOT NULL,
    classroom text NOT NULL,
    access_code text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS unit3_student_identity ON unit3_students (name, classroom)`,
  `CREATE TABLE IF NOT EXISTS unit3_attempts (
    id serial PRIMARY KEY,
    student_id integer NOT NULL REFERENCES unit3_students(id),
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    score integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'in_progress'
  )`,
  `CREATE TABLE IF NOT EXISTS unit3_answers (
    id serial PRIMARY KEY,
    attempt_id integer NOT NULL REFERENCES unit3_attempts(id),
    question integer NOT NULL,
    response jsonb NOT NULL,
    score integer NOT NULL DEFAULT 0,
    correct boolean NOT NULL DEFAULT false,
    needs_review boolean NOT NULL DEFAULT false,
    feedback text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS unit3_answer_once ON unit3_answers (attempt_id, question)`,
  `CREATE TABLE IF NOT EXISTS unit3_keys (
    id text PRIMARY KEY,
    role text NOT NULL,
    student_id integer,
    student_name text,
    expires_at timestamptz NOT NULL
  )`,
];

let ready: Promise<void> | null = null;

export function ensureSchema() {
  ready ??= (async () => {
    for (const statement of statements) await query(statement);
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
