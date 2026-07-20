import { site } from "@/lib/site-config";

export type SeasonalAlertSignal = {
  year: number;
  month: string;
  sourceDate: string;
  sourceTitle: string;
  sourceUrl: string;
  region: string;
  observedOn: string;
  interpretation: string;
};

export type SeasonalAlert = {
  slug: string;
  title: string;
  threatType: string;
  organism: string;
  status: string;
  severity: "niskie" | "średnie" | "wysokie";
  confidence: "niska" | "średnia" | "wysoka";
  plantSlugs: string[];
  plantNames: string[];
  typicalMonths: string[];
  signals: SeasonalAlertSignal[];
  symptoms: string[];
  gardenAction: string;
  whatNotToDo: string;
  articleHref: string | null;
  updated_at: string;
};

function backendUrl(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL || site.publicUrl;
  }
  return "";
}

function normalizeAlerts(value: unknown): SeasonalAlert[] {
  return Array.isArray(value) ? value as SeasonalAlert[] : [];
}

export async function getSeasonalAlertsForPlant(plantSlug: string): Promise<SeasonalAlert[]> {
  if (!plantSlug) return [];
  try {
    const res = await fetch(`${backendUrl()}/api/alerts/plant/${encodeURIComponent(plantSlug)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalizeAlerts(await res.json());
  } catch (err) {
    console.warn(`Failed to load seasonal alerts for plant "${plantSlug}":`, err);
    return [];
  }
}
