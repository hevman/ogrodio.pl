/** Etykiety WMO (Open-Meteo) — uproszczone opisy po polsku. */
const WEATHER_LABELS: Record<number, string> = {
  0: "Bezchmurnie",
  1: "Prawie bezchmurnie",
  2: "Częściowe zachmurzenie",
  3: "Pochmurno",
  45: "Mgła",
  48: "Szronowa mgła",
  51: "Mżawka",
  53: "Mżawka",
  55: "Mżawka",
  61: "Deszcz",
  63: "Deszcz",
  65: "Intensywny deszcz",
  71: "Śnieg",
  73: "Śnieg",
  75: "Intensywny śnieg",
  80: "Przelotne opady",
  81: "Przelotne opady",
  82: "Ulewa",
  95: "Burza",
  96: "Burza z gradem",
  99: "Burza z gradem",
};

export function weatherCodeLabel(code: number): string {
  return WEATHER_LABELS[code] || "Pogoda";
}

export function formatWeatherDay(date: string): string {
  const value = new Date(`${date}T12:00:00`);
  return value.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "numeric" });
}

export function formatWeatherDate(date: string): string {
  const value = new Date(`${date}T12:00:00`);
  return value.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}

export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 95) return "⛈️";
  if (code >= 71) return "❄️";
  if (code >= 51) return "🌧️";
  return "🌤️";
}
