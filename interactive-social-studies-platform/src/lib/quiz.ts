export const SCHOOL = "مدرسة العروس الابتدائية";
export const MAX_SCORE = 90;
export type Option = { id: string; text: string; correct?: boolean };
export const eventCards = [
  { id: "a", text: "عودة الإمام فيصل بن تركي من مصر" },
  { id: "b", text: "انتهاء الدولة السعودية الثانية" },
  { id: "c", text: "تأسيس الإمام تركي بن عبدالله الدولة السعودية الثانية" },
  { id: "d", text: "خروج الإمام عبدالرحمن بن فيصل من الرياض عند نهاية الدولة السعودية الثانية" },
];
export const statements: Option[] = [
  { id: "s1", text: "مؤسس الدولة السعودية الأولى هو الإمام فيصل بن تركي.", correct: false },
  { id: "s2", text: "اهتم الإمام عبدالعزيز بن محمد بن سعود بالصغار وشجعهم.", correct: true },
  { id: "s3", text: "ولد الملك عبدالعزيز بعد نهاية الدولة السعودية الأولى مباشرة.", correct: false },
  { id: "s4", text: "اتخذ الإمام تركي بن عبدالله الرياض عاصمة للدولة السعودية الثانية.", correct: true },
];
export const trueFalse = statements.map((item) => item.text);
export const choiceGroups = [
  { id: "year", title: "تأسست الدولة السعودية الثانية عام:", correct: "1240", options: [{ id: "1240", text: "1240هـ" }, { id: "1139", text: "1139هـ" }, { id: "1257", text: "1257هـ" }, { id: "1319", text: "1319هـ" }] },
  { id: "ruler", title: "الحاكم الثاني للدولة السعودية الثانية:", correct: "faisal", options: [{ id: "faisal", text: "الإمام فيصل بن تركي" }, { id: "abdulrahman", text: "الإمام عبدالرحمن بن فيصل" }, { id: "abdullah", text: "الإمام عبدالله بن فيصل" }] },
  { id: "founder", title: "مؤسس الدولة السعودية الثانية هو الإمام:", correct: "turki", options: [{ id: "abdullah-m", text: "عبدالله بن محمد بن سعود" }, { id: "faisal2", text: "فيصل بن تركي" }, { id: "turki", text: "تركي بن عبدالله" }, { id: "abdulrahman2", text: "عبدالرحمن بن فيصل" }] },
];
export const choices = choiceGroups.map((group) => ({ title: group.title, options: group.options.map((option) => option.text) }));
export const q4 = {
  resultOptions: [
    { id: "rise", text: "قيام الدولة السعودية الثانية واستقرار الحكم" },
    { id: "fall", text: "سقوط الدولة السعودية الأولى نهائيًا" },
    { id: "egypt", text: "انتقال الحكم إلى مصر" },
    { id: "stay", text: "بقاء الدرعية عاصمة دون تغيير" },
  ],
  causeOptions: [
    { id: "destroy", text: "تدمير الدرعية وخرابها فلم تعد صالحة لتكون عاصمة" },
    { id: "family", text: "رغبة الإمام تركي في الابتعاد عن أقاربه" },
    { id: "farms", text: "كثرة المزارع في الرياض فقط" },
    { id: "order", text: "أمر عثماني باختيار الرياض عاصمة" },
  ],
};
export const causeResult = {
  5: { event: "عودة الدولة السعودية في دورها الثاني", cause: "principles", result: "stable", causes: [{ id: "principles", text: "قوة المبادئ وتأييد الناس وقيادة الإمام تركي" }, { id: "fear", text: "خوف أهل نجد ورفضهم عودة الحكم" }, { id: "ottoman", text: "رغبة العثمانيين في إعادة آل سعود" }, { id: "empty", text: "خلو نجد من السكان بعد سقوط الدولة الأولى" }], results: [{ id: "stable", text: "استقرار الحكم السعودي من جديد في نجد" }, { id: "ended", text: "انتهاء الدولة السعودية إلى الأبد" }, { id: "egypt", text: "انتقال العاصمة إلى مصر" }, { id: "chaos", text: "استمرار الفوضى دون حاكم" }] },
  6: { event: "تأسيس الإمام تركي بن عبدالله الدولة السعودية الثانية", cause: "traits", result: "dream", causes: [{ id: "traits", text: "شجاعته ووطنيته وحسن تخطيطه وقيادته" }, { id: "luck", text: "اعتماده على الحظ دون تخطيط" }, { id: "foreign", text: "مساعدة دولة أجنبية له بالمال والسلاح" }, { id: "reject", text: "رفض الناس مساعدته" }], results: [{ id: "dream", text: "تحقيق حلمه بإعادة الدولة السعودية" }, { id: "fail", text: "فشله في إعادة الحكم" }, { id: "leave", text: "خروجه من نجد نهائيًا" }, { id: "diriyah", text: "إعادة بناء الدرعية عاصمة فورًا" }] },
  7: { event: "معركة الحلوة", cause: "many", result: "called", causes: [{ id: "many", text: "كثرة قتلى القوات العثمانية المعتدية فيها" }, { id: "sweet", text: "حلاوة طعم الماء في موقع المعركة" }, { id: "rome", text: "حضور جنود من روما القديمة" }, { id: "leader", text: "اسم قائد المعركة كان الروم" }], results: [{ id: "called", text: "تسميتها بمعركة الروم" }, { id: "loss", text: "هزيمة الإمام تركي بن عبدالله" }, { id: "peace", text: "عقد صلح دائم مع العثمانيين" }, { id: "move", text: "نقل العاصمة من الرياض" }] },
  8: { event: "انتصار الإمام فيصل بن تركي رغم سجنه", cause: "contact", result: "victory", causes: [{ id: "contact", text: "تواصله مع أنصاره وتوجيههم من السجن" }, { id: "surrender", text: "استسلامه للقوات المعتدية" }, { id: "alone", text: "قتال أهل نجد دون علمه" }, { id: "gift", text: "إطلاق سراحه فورًا دون مقاومة" }], results: [{ id: "victory", text: "خروجه وقيادته المقاومة حتى النصر" }, { id: "stay", text: "بقاؤه في السجن حتى نهاية الدولة" }, { id: "lose", text: "انتصار الحملات العثمانية" }, { id: "end", text: "انتهاء الدولة السعودية الثانية" }] },
} as const;
export const civilization = [
  { id: "bayah", text: "البيعة", category: "الإدارة والحكم" },
  { id: "schools", text: "إنشاء دور للعلم", category: "التعليم" },
  { id: "children", text: "تشجيع الصغار على قراءتهم", category: "التعليم" },
  { id: "palaces", text: "بناء قصور الحكم", category: "العمران" },
  { id: "guards", text: "العسس", category: "الأمن" },
  { id: "sharia", text: "تطبيق الشريعة على المخالفين", category: "الأمن" },
  { id: "heir", text: "ولاية العهد", category: "الإدارة والحكم" },
  { id: "guests", text: "بناء دور الضيافة", category: "العمران" },
];
export const categories = ["الإدارة والحكم", "التعليم", "الأمن", "العمران"];
export const questionTitles = ["ترتيب الأحداث التاريخية", "صح أم خطأ؟", "اختر الإجابة الصحيحة", "السبب والحدث والنتيجة", "لماذا عادت الدولة السعودية؟", "نبذة عن الإمام تركي", "معركة الحلوة", "الإمام فيصل بن تركي", "الجوانب الحضارية"];
export const explanations = [
  "الترتيب الصحيح: تأسيس الدولة، ثم عودة الإمام فيصل، ثم خروج الإمام عبدالرحمن، ثم انتهاء الدولة.",
  "أسس الإمام محمد بن سعود الدولة الأولى، وجعل الإمام تركي الرياض عاصمة للدولة الثانية.",
  "تأسست الدولة الثانية سنة ١٢٤٠هـ على يد الإمام تركي بن عبدالله، وخلفه ابنه الإمام فيصل.",
  "النتيجة قيام الدولة واستقرارها، والسبب تدمير الدرعية فلم تعد صالحة عاصمة.",
  "عادت الدولة لقوة مبادئها وتأييد الناس وقيادة الإمام تركي، فاستقر الحكم من جديد.",
  "أسس الإمام تركي الدولة بشجاعة ووطنية وتخطيط وقيادة، فحقق حلم إعادة الدولة.",
  "سُمّيت معركة الحلوة بمعركة الروم لكثرة قتلى القوات العثمانية المعتدية فيها.",
  "وجّه الإمام فيصل أنصاره من السجن، ثم خرج وقاد المقاومة حتى انتصر.",
  "من مظاهر الحضارة: البيعة وولاية العهد للإدارة، دور العلم للتعليم، العسس للأمن، والقصور للعمران.",
];
export const facts = [
  "هل تعلم؟ جعل الإمام تركي الرياض عاصمة للدولة السعودية الثانية.",
  "هل تعلم؟ كان الإمام فيصل بن تركي ثاني حكام الدولة السعودية الثانية.",
  "هل تعلم؟ بدأت الدولة السعودية الثانية عام ١٢٤٠هـ.",
  "هل تعلم؟ أصبحت الرياض مركزًا للحكم بعد الدرعية.",
  "هل تعلم؟ بقيت مبادئ الدولة السعودية حية في قلوب أهلها.",
  "هل تعلم؟ اشتهر الإمام تركي بشجاعته وقيادته.",
  "هل تعلم؟ تقع الحلوة في جنوب منطقة الرياض.",
  "هل تعلم؟ عاد الإمام فيصل إلى الحكم بعد فترة من الأسر.",
  "هل تعلم؟ كان العسس يحرسون الطرق والأسواق ليلًا.",
];
export type ResponseValue = string[] | boolean[] | number[] | Record<string, string | boolean> | string;
const record = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string> : {};
const points = (count: number, total: number) => Math.round(count / total * 10);
const textOf = (options: Option[], id: string) => options.find((item) => item.id === id)?.text || id;
export function isComplete(q: number, value: unknown): boolean {
  if (q === 1) return Array.isArray(value) && value.filter((item) => eventCards.some((card) => card.id === item)).length === 4;
  if (q === 2) return statements.every((item) => typeof record(value)[item.id] === "boolean" || (Array.isArray(value) && typeof value[statements.indexOf(item)] === "boolean"));
  if (q === 3) return choiceGroups.every((group, index) => Boolean(record(value)[group.id]) || (Array.isArray(value) && typeof value[index] === "number"));
  if (q === 4) return Boolean(record(value).result && record(value).reason);
  if (q >= 5 && q <= 8) return Boolean(record(value).cause && record(value).result);
  if (q === 9) return civilization.every((card) => Boolean(record(value)[card.id]));
  return false;
}
export function grade(q: number, value: unknown) {
  let score = 0;
  if (q === 1 && Array.isArray(value)) score = points(value.filter((item, index) => item === ["c", "a", "d", "b"][index]).length, 4);
  if (q === 2) score = points(statements.filter((item, index) => (Array.isArray(value) ? value[index] : record(value)[item.id]) === item.correct).length, 4);
  if (q === 3) score = points(choiceGroups.filter((group, index) => (Array.isArray(value) ? group.options[Number(value[index])]?.id : record(value)[group.id]) === group.correct).length, 3);
  if (q === 4) score = (record(value).result === "rise" ? 5 : 0) + (record(value).reason === "destroy" ? 5 : 0);
  if (q >= 5 && q <= 8) { const bank = causeResult[q as 5 | 6 | 7 | 8]; score = (record(value).cause === bank.cause ? 5 : 0) + (record(value).result === bank.result ? 5 : 0); }
  if (q === 9) score = points(civilization.filter((card) => record(value)[card.id] === card.category).length, 8);
  if (!isComplete(q, value)) score = 0;
  return { score, correct: score === 10, needsReview: false, feedback: explanations[q - 1] };
}
export function describeResponse(question: number, value: unknown) {
  if (question === 1 && Array.isArray(value)) return value.map((id, index) => `${index + 1}. ${eventCards.find((card) => card.id === id)?.text || "—"}`).join(" • ");
  if (question === 2) return statements.map((item, index) => `${item.text}: ${(Array.isArray(value) ? value[index] : record(value)[item.id]) ? "صح" : "خطأ"}`).join(" • ");
  if (question === 3) return choiceGroups.map((group, index) => `${group.title} ${textOf(group.options, Array.isArray(value) ? group.options[Number(value[index])]?.id || "" : record(value)[group.id])}`).join(" • ");
  if (question === 4) return `النتيجة: ${textOf(q4.resultOptions, record(value).result)} • السبب: ${textOf(q4.causeOptions, record(value).reason)}`;
  if (question >= 5 && question <= 8) { const bank = causeResult[question as 5 | 6 | 7 | 8]; return `السبب: ${textOf([...bank.causes], record(value).cause)} • النتيجة: ${textOf([...bank.results], record(value).result)}`; }
  if (question === 9) return civilization.map((card) => `${card.text}: ${record(value)[card.id] || "—"}`).join(" • ");
  return String(value || "—");
}
