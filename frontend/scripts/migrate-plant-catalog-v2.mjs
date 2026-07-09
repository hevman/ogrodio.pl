import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const SEASONAL_FILLERS = {
  winter: { task: "Kontrola okryć zimowych i stanu pędów", type: "care" },
  lateWinter: { task: "Przegląd rośliny i plan prac na wiosnę", type: "care" },
  spring: { task: "Obserwuj wzrost i dostosuj podlewanie do pogody", type: "care" },
  summer: { task: "Regularna kontrola podlewania i zdrowia rośliny", type: "care" },
  autumn: { task: "Przygotowanie rośliny na chłodniejsze noce", type: "care" },
  lateAutumn: { task: "Zabezpieczenie na zimę i uzupełnienie ściółki", type: "care" },
};

function fillerForMonth(month) {
  if (month === "I" || month === "XII") return SEASONAL_FILLERS.winter;
  if (month === "II") return SEASONAL_FILLERS.lateWinter;
  if (month === "III" || month === "IV" || month === "V") return SEASONAL_FILLERS.spring;
  if (month === "VI" || month === "VII" || month === "VIII") return SEASONAL_FILLERS.summer;
  if (month === "IX" || month === "X") return SEASONAL_FILLERS.autumn;
  return SEASONAL_FILLERS.lateAutumn;
}

function isGroupedCalendar(calendar) {
  return calendar.length > 0 && Array.isArray(calendar[0].tasks);
}

function toGroupedCalendar(calendar) {
  if (isGroupedCalendar(calendar)) return calendar;

  const byMonth = new Map();
  for (const entry of calendar) {
    if (!byMonth.has(entry.month)) byMonth.set(entry.month, []);
    byMonth.get(entry.month).push({
      task: entry.task,
      type: entry.type,
      week: null,
      articleHref: null,
    });
  }

  return MONTHS.map((month) => ({
    month,
    tasks: byMonth.get(month) || [fillerForMonth(month)],
  }));
}

function normalizeProblems(problems) {
  if (!problems?.length) return [];
  if (typeof problems[0] === "string") {
    return problems.map((symptom) => ({ symptom }));
  }
  return problems;
}

function inferRisks(plant) {
  if (plant.risks?.length) return plant.risks;

  const risks = [];
  const text = `${plant.summary} ${plant.water} ${(plant.problems || []).join(" ")}`.toLowerCase();

  if (/(suszy|upał|przesych|podlew)/.test(text)) {
    risks.push({
      title: "Stres wodny w sezonie ciepłym",
      months: ["VI", "VII", "VIII"],
      urgency: "wysokie",
      symptom: "Liście więdną, wzrost zwalnia lub owoce kurczą się",
      action: "Podlewaj rano małymi dawkami i utrzymuj ściółkę.",
      articleHref: null,
    });
  }

  if (/(mroz|przymro|zimow|okry|chłod)/.test(text)) {
    risks.push({
      title: "Ryzyko chłodu i przymrozków",
      months: ["III", "IV", "X", "XI"],
      urgency: "średnie",
      symptom: "Czerniejące pędy lub uszkodzone młode liście po chłodnej nocy",
      action: "Zabezpiecz roślinę przed spadkami temperatury i opóźnij prace w polu.",
      articleHref: null,
    });
  }

  if (/(mszyc|mączniak|pleśń|plam|szkodnik|chorob)/.test(text)) {
    risks.push({
      title: "Kontrola zdrowotna",
      months: ["V", "VI", "VII", "VIII", "IX"],
      urgency: "średnie",
      symptom: "Plamy na liściach, osłabiony wzrost lub obecność szkodników",
      action: "Raz w tygodniu obejrzyj liście i pędy. Reaguj wcześnie.",
      articleHref: null,
    });
  }

  return risks;
}

const plantsDir = join(process.cwd(), "src", "content", "plants");
const skip = new Set(["borowka-amerykanska.json"]);

for (const file of readdirSync(plantsDir).filter((name) => name.endsWith(".json") && !skip.has(name))) {
  const path = join(plantsDir, file);
  const plant = JSON.parse(readFileSync(path, "utf8"));
  const next = {
    ...plant,
    calendar: toGroupedCalendar(plant.calendar || []),
    problems: normalizeProblems(plant.problems),
    risks: inferRisks(plant),
    varieties: plant.varieties || [],
  };
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`migrated ${file}`);
}

console.log("done");
