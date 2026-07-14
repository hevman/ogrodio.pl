/**
 * Klient wyszukiwania przez backend proxy → Meilisearch.
 * Używany na /porady i /katalog-roslin.
 */

function backendUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL || '';
  }
  return '';
}

export interface ArticleHit {
  slug: string;
  title: string;
  topic: string;
  summary: string;
  cover_image: string;
  cover_alt: string;
  reading_minutes: number;
  updated_at: string;
}

export interface PlantHit {
  slug: string;
  name: string;
  latinName: string;
  summary: string;
  group: string;
  image: string;
  imageAlt: string;
  difficulty: string;
  harvest: string;
}

export async function searchArticles(
  query: string,
  topic?: string,
): Promise<ArticleHit[]> {
  if (!query.trim()) return [];
  try {
    const qs = new URLSearchParams({ q: query, limit: '24' });
    if (topic) qs.set('topic', topic);
    const res = await fetch(`${backendUrl()}/api/articles/search?${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.hits) ? data.hits : [];
  } catch {
    return [];
  }
}

export async function searchPlants(
  query: string,
  group?: string,
): Promise<PlantHit[]> {
  if (!query.trim()) return [];
  try {
    const qs = new URLSearchParams({ q: query, limit: '20' });
    if (group) qs.set('group', group);
    const res = await fetch(`${backendUrl()}/api/plants/search?${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.hits) ? data.hits : [];
  } catch {
    return [];
  }
}
