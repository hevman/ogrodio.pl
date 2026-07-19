export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchTerms(query: string) {
  return normalizeSearchText(query)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

export function textMatchesQuery(text: string, query: string) {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  const normalizedText = normalizeSearchText(text);
  return terms.every((term) => normalizedText.includes(term));
}
