export const CLASS_OPTIONS = [
  { id: "b", label: "السادس ب" },
] as const;

export const ACTIVE_CLASSROOM = "السادس ب";

export function normalizeClassroom(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.normalize("NFC").trim();
  if (value === "b" || value === ACTIVE_CLASSROOM) return ACTIVE_CLASSROOM;
  const compact = value.replace(/[\sـ]/g, "").replace(/[إآ]/g, "ا").replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632));
  const aliases = ["ب", "6ب", "6/2", "السادسب"];
  return aliases.includes(compact) ? ACTIVE_CLASSROOM : null;
}
