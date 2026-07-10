import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const plantsDir = join(process.cwd(), "src", "content", "plants");
const files = readdirSync(plantsDir).filter((name) => name.endsWith(".json"));

let failed = false;

for (const file of files) {
  const plant = JSON.parse(readFileSync(join(plantsDir, file), "utf8"));
  const calendar = plant.calendar || [];

  if (!calendar.length) {
    console.error(`${file}: missing calendar`);
    failed = true;
    continue;
  }

  const months = new Set();
  for (const block of calendar) {
    if (!block.month || !Array.isArray(block.tasks)) {
      console.error(`${file}: invalid month block for ${block.month || "?"}`);
      failed = true;
      continue;
    }
    months.add(block.month);
    for (const task of block.tasks) {
      if (!task.task || !task.type) {
        console.error(`${file}: invalid task in month ${block.month}`);
        failed = true;
      }
    }
  }

  const missing = MONTHS.filter((month) => !months.has(month));
  if (missing.length) {
    console.error(`${file}: missing months ${missing.join(", ")}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`validated ${files.length} plant catalog files`);
