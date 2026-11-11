export const SCHOOL = "مدرسة العروس الابتدائية";
export const MAX_SCORE = 90;
export const eventCards = [
  { id: "a", text: "عودة الإمام فيصل بن تركي من مصر" },
  { id: "b", text: "انتهاء الدولة السعودية الثانية" },
  { id: "c", text: "تأسيس الإمام تركي بن عبدالله الدولة السعودية الثانية" },
  { id: "d", text: "خروج الإمام عبدالرحمن بن فيصل من الرياض عند نهاية الدولة السعودية الثانية" },
];
export const trueFalse = [
  "مؤسس الدولة السعودية الأولى هو الإمام فيصل بن تركي.",
  "اهتم الإمام عبدالعزيز بن محمد بن سعود بالصغار وشجعهم.",
  "ولد الملك عبدالعزيز بعد نهاية الدولة السعودية الأولى مباشرة.",
  "اتخذ الإمام تركي بن عبدالله الرياض عاصمة للدولة السعودية الثانية.",
];
export const choices = [
  { title: "تأسست الدولة السعودية الثانية عام:", options: ["1240هـ", "1139هـ", "1257هـ", "1319هـ"] },
  { title: "الحاكم الثاني للدولة السعودية الثانية:", options: ["الإمام فيصل بن تركي", "الإمام عبدالرحمن بن فيصل", "الإمام عبدالله بن فيصل"] },
  { title: "مؤسس الدولة السعودية الثانية هو الإمام:", options: ["عبدالله بن محمد بن سعود", "فيصل بن تركي", "تركي بن عبدالله", "عبدالرحمن بن فيصل"] },
];
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
  "بدأت الدولة الثانية عام ١٢٤٠هـ، ثم عاد الإمام فيصل من مصر، وبعد خروج الإمام عبدالرحمن انتهت الدولة عام ١٣٠٩هـ.",
  "أسس الإمام محمد بن سعود الدولة الأولى، وجعل الإمام تركي الرياض عاصمة للدولة الثانية.",
  "تأسست الدولة الثانية سنة ١٢٤٠هـ على يد الإمام تركي بن عبدالله، وخلفه ابنه الإمام فيصل.",
  "أسهم تأييد الناس في قيام الدولة الثانية، واختيرت الرياض بعد تدمير الدرعية لتصبح عاصمة مزدهرة.",
  "عادت الدولة لقوة مبادئها، وتأييد الناس لها، وقيادة الإمام تركي وشجاعته في استعادة الحكم.",
  "قاد الإمام تركي جهود تأسيس الدولة الثانية بشجاعة ووطنية وتخطيط حتى حقق حلمه.",
  "سُمّيت معركة الحلوة بمعركة الروم لكثرة قتلى القوات العثمانية المعتدية فيها.",
  "قاد الإمام فيصل أنصاره من سجنه بالتوجيه والتواصل، ثم عاد وقاد المقاومة بعد خروجه.",
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

export type ChoiceOption = { id: string; text: string };
export type OptionSlot = { key: string; label: string; options: ChoiceOption[]; correct: string };
export const optionSlots: Record<number, OptionSlot[]> = {
  4: [
    { key: "result", label: "النتيجة", correct: "q4-result-a", options: [
      { id: "q4-result-a", text: "قيام الدولة السعودية الثانية واستقرار الحكم فيها" },
      { id: "q4-result-b", text: "انتهاء الدولة السعودية الأولى مباشرة" },
      { id: "q4-result-c", text: "انتقال العاصمة إلى جدة" },
    ] },
    { key: "reason", label: "السبب", correct: "q4-reason-a", options: [
      { id: "q4-reason-a", text: "تدمير الدرعية والحاجة إلى عاصمة جديدة للدولة" },
      { id: "q4-reason-b", text: "رغبة الإمام تركي في ترك الحكم" },
      { id: "q4-reason-c", text: "ضعف تأييد الناس للدولة السعودية" },
    ] },
  ],
  6: [
    { key: "cause", label: "السبب", correct: "q6-cause-a", options: [
      { id: "q6-cause-a", text: "شجاعته ووطنيته وتخطيطه وقيادته الحكيمة" },
      { id: "q6-cause-b", text: "اعتماده على الحملات الخارجية وحدها" },
      { id: "q6-cause-c", text: "تخلّيه عن التخطيط وقيادة أنصاره" },
    ] },
    { key: "result", label: "النتيجة", correct: "q6-result-a", options: [
      { id: "q6-result-a", text: "تحقيق حلمه بتأسيس الدولة السعودية الثانية" },
      { id: "q6-result-b", text: "إنهاء الدولة السعودية الثانية قبل قيامها" },
      { id: "q6-result-c", text: "بقاء الحكم بعيدًا عن الرياض" },
    ] },
  ],
  7: [
    { key: "cause", label: "السبب", correct: "q7-cause-a", options: [
      { id: "q7-cause-a", text: "كثرة قتلى القوات العثمانية المعتدية في المعركة" },
      { id: "q7-cause-b", text: "وقوع المعركة في مدينة الروم" },
      { id: "q7-cause-c", text: "انتهاء المعركة دون قتال" },
    ] },
    { key: "result", label: "النتيجة", correct: "q7-result-a", options: [
      { id: "q7-result-a", text: "سُمّيت معركة الحلوة بمعركة الروم" },
      { id: "q7-result-b", text: "سُمّيت معركة الروم بمعركة الدرعية" },
      { id: "q7-result-c", text: "أُطلق على المعركة اسم معركة الحلوة الأولى فقط" },
    ] },
  ],
  8: [
    { key: "cause", label: "السبب", correct: "q8-cause-a", options: [
      { id: "q8-cause-a", text: "توجيه أنصاره والتواصل معهم من السجن، ثم قيادة المقاومة بعد عودته" },
      { id: "q8-cause-b", text: "توقف أنصاره عن المقاومة أثناء سجنه" },
      { id: "q8-cause-c", text: "انضمامه إلى الحملات العثمانية المعتدية" },
    ] },
    { key: "result", label: "النتيجة", correct: "q8-result-a", options: [
      { id: "q8-result-a", text: "الانتصار على الحملات العثمانية المعتدية" },
      { id: "q8-result-b", text: "إنهاء الدولة السعودية الثانية فورًا" },
      { id: "q8-result-c", text: "بقاء الإمام فيصل في السجن دون عودة" },
    ] },
  ],
};
export const q5Options: ChoiceOption[] = [
  { id: "q5-r1", text: "قوة مبادئ الدولة السعودية الأولى ورسوخها في النفوس" },
  { id: "q5-r2", text: "تأييد الناس ومساندتهم لعودة الحكم السعودي" },
  { id: "q5-r3", text: "قيادة الإمام تركي بن عبدالله وشجاعته في استعادة الحكم" },
  { id: "q5-r4", text: "رغبة الناس في انتهاء الحكم السعودي" },
  { id: "q5-r5", text: "ضعف ارتباط الناس بالرياض والدرعية" },
  { id: "q5-r6", text: "تخلي الإمام تركي عن تأييد أنصاره" },
];
export const q5Correct = ["q5-r1", "q5-r2", "q5-r3"];

export type QuizLayout = {
  version: 1;
  order: string[];
  trueFalse: number[];
  choices: number[][];
  optionOrders: Record<string, string[]>;
  q5: string[];
  civilization: string[];
  categories: string[];
};
function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  if (copy.length > 1 && copy.every((value, index) => value === items[index])) copy.push(copy.shift()!);
  return copy;
}
export const defaultLayout: QuizLayout = {
  version: 1,
  order: eventCards.map(card => card.id),
  trueFalse: trueFalse.map((_, index) => index),
  choices: choices.map(group => group.options.map((_, index) => index)),
  optionOrders: Object.fromEntries(Object.entries(optionSlots).flatMap(([question, slots]) => slots.map(slot => [`${question}:${slot.key}`, slot.options.map(option => option.id)]))),
  q5: q5Options.map(option => option.id),
  civilization: civilization.map(card => card.id),
  categories: [...categories],
};
export function createLayout(): QuizLayout {
  const order = shuffled(defaultLayout.order);
  if (order.join("|") === "c|a|d|b") order.push(order.shift()!);
  return {
    version: 1,
    order,
    trueFalse: shuffled(defaultLayout.trueFalse),
    choices: defaultLayout.choices.map(group => shuffled(group)),
    optionOrders: Object.fromEntries(Object.entries(defaultLayout.optionOrders).map(([key, value]) => [key, shuffled(value)])),
    q5: shuffled(defaultLayout.q5),
    civilization: shuffled(defaultLayout.civilization),
    categories: shuffled(defaultLayout.categories),
  };
}
export function optionText(question: number, key: string, id: string) {
  return optionSlots[question]?.find(slot => slot.key === key)?.options.find(option => option.id === id)?.text || id;
}

export type ResponseValue = string[] | boolean[] | number[] | Record<string, string> | string;
const normalize = (s: string) => s.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ًٌٍَُِّْـ،.؟!]/g, " ").trim();
const has = (s: string, words: string[]) => words.some(w => normalize(s).includes(normalize(w)));
const points = (count: number, total: number) => Math.round(count / total * 10);
const slotFilled = (question: number, value: Record<string, string>) => optionSlots[question].every(slot => !!String(value[slot.key] || "").trim());
const slotOptions = (question: number, value: Record<string, string>) => optionSlots[question].every(slot => optionSlots[question].find(s => s.key === slot.key)!.options.some(option => option.id === value[slot.key]));
export function isComplete(q: number, value: unknown): boolean {
  if (q === 1) return Array.isArray(value) && value.length === 4 && new Set(value).size === 4 && value.every(id => eventCards.some(card => card.id === id));
  if (q === 2) return Array.isArray(value) && value.length === 4 && value.every(v => typeof v === "boolean");
  if (q === 3) return Array.isArray(value) && value.length === 3 && value.every((v, i) => Number.isInteger(v) && v >= 0 && v < choices[i].options.length);
  if (q === 4) return !!value && typeof value === "object" && !Array.isArray(value) && slotFilled(4, value as Record<string, string>);
  if (q === 5) return Array.isArray(value) && value.length === 3 && value.every(v => typeof v === "string" && v.trim().length > 0);
  if (q === 6 || q === 7 || q === 8) {
    if (typeof value === "string") return value.trim().length > 0;
    return !!value && typeof value === "object" && !Array.isArray(value) && slotFilled(q, value as Record<string, string>);
  }
  if (q === 9) return !!value && typeof value === "object" && !Array.isArray(value) && civilization.every(c => !!(value as Record<string, string>)[c.id]);
  return false;
}
export function grade(q: number, value: unknown) {
  let score = 0;
  let needsReview = false;
  if (q === 1 && Array.isArray(value)) score = points(value.filter((v, i) => v === ["c", "a", "d", "b"][i]).length, 4);
  if (q === 2 && Array.isArray(value)) score = points(value.filter((v, i) => v === [false, true, false, true][i]).length, 4);
  if (q === 3 && Array.isArray(value)) score = points(value.filter((v, i) => v === [0, 0, 2][i]).length, 3);
  if (q === 9 && value && typeof value === "object") score = points(civilization.filter(c => (value as Record<string, string>)[c.id] === c.category).length, 8);
  if (q === 4 && value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, string>;
    if (slotOptions(4, v)) score = points(optionSlots[4].filter(slot => v[slot.key] === slot.correct).length, optionSlots[4].length);
    else { needsReview = true; score = (has(v.result || "", ["قيام", "تأسيس", "عودة", "استقرار", "نجاح"]) && has(v.result || "", ["الدولة", "السعودية", "الحكم"]) ? 5 : 0) + (has(v.reason || "", ["تدمير", "خراب", "سقوط", "دمار"]) && has(v.reason || "", ["الدرعية", "العاصمة"]) ? 5 : 0); }
  }
  if (q === 5 && Array.isArray(value)) {
    if (value.every(id => q5Options.some(option => option.id === id))) score = points(q5Correct.filter(id => value.includes(id)).length, 3);
    else { const s = value.join(" "); needsReview = true; score = points([has(s, ["مبادئ", "دين", "شريعة", "اسس"]), has(s, ["تأييد", "مساندة", "دعم", "التفاف"]), has(s, ["تركي", "قيادة", "شجاعة", "تخطيط"])].filter(Boolean).length, 3); }
  }
  if (q === 6 || q === 7 || q === 8) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const v = value as Record<string, string>;
      if (slotOptions(q, v)) score = points(optionSlots[q].filter(slot => v[slot.key] === slot.correct).length, optionSlots[q].length);
      else needsReview = true;
    } else if (typeof value === "string") {
      needsReview = true;
      if (q === 6) score = points([["شجاعة", "شجاع"], ["وطنية", "وطن"], ["تخطيط", "خطط"], ["حلم", "حقق"], ["قيادة", "قاد", "قائد"]].filter(group => has(value, group)).length, 5);
      if (q === 7) score = has(value, ["العثمان", "الروم", "الترك"]) && has(value, ["كثر", "كثرة", "قتل", "هزيم", "خسائر"]) ? 10 : has(value, ["العثمان", "الروم", "الترك"]) ? 5 : 0;
      if (q === 8) score = (has(value, ["سجن", "أسر", "مصر"]) ? 3 : 0) + (has(value, ["اتصال", "تواصل", "رسائل", "وجه", "أنصار", "تابع"]) ? 4 : 0) + (has(value, ["عاد", "خرج", "قاد", "انتصر", "مقاومة"]) ? 3 : 0);
    }
  }
  if (!isComplete(q, value)) score = 0;
  return { score, correct: score === 10, needsReview, feedback: explanations[q - 1] };
}
