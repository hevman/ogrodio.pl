const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../content/articles/pomidory-koktajlowe-w-donicy.json');

let content = fs.readFileSync(filePath, 'utf8');

// Usuń BOM jeśli istnieje
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// Zamiany: determinate/indeterminate → polskie odpowiedniki
const replacements = [
  ['determinate (krzaczaste, skończone)', 'krzaczasty (samokończący)'],
  ['determinate (rosnące przez cały sezon)', 'wysokopienny (rosnący przez cały sezon)'],
  ['indeterminate (rosnące bez ograniczeń)', 'wysokopienny (rosnący bez ograniczeń)'],
  ['indeterminate (nieograniczone)', 'wysokopienny (nieograniczony)'],
  ['koktajlowych indeterminate', 'koktajlowych wysokopiennych'],
  ['odmian indeterminate', 'odmian wysokopiennych'],
  ['odmiany indeterminate', 'odmiany wysokopiennej'],
  ['indeterminate usuwaj', 'wysokopiennych usuwaj'],
  ['determinate nie usuwaj', 'krzaczastych nie usuwaj'],
  // w tabeli group:
  ['"determinate,', '"krzaczasty,'],
  ['"indeterminate,', '"wysokopienny,'],
  // w notes tabeli
  ['determinate, ', 'krzaczasty, '],
  ['indeterminate, ', 'wysokopienny, '],
  // w summary
  ['Karłowe odmiany determinate sadzisz', 'Karłowe odmiany krzaczaste sadzisz'],
  // w sections
  ['Odmiany determinate ', 'Odmiany krzaczaste '],
  ['odmianę karłową determinateodmianę', 'odmianę karłową'],
  // pozostałe
  ['determinate', 'krzaczasty'],
  ['indeterminate', 'wysokopienny'],
];

for (const [from, to] of replacements) {
  content = content.split(from).join(to);
}

// Zapisz bez BOM, UTF-8
fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log('Gotowe — plik zapisany bez BOM, polskie znaki zachowane');

// Weryfikacja
const check = fs.readFileSync(filePath, 'utf8');
if (check.charCodeAt(0) === 0xFEFF) {
  console.error('BOM nadal obecny!');
} else {
  console.log('BOM usunięty, encoding OK');
  console.log('Pierwsze 100 znaków:', check.slice(0, 100));
}
