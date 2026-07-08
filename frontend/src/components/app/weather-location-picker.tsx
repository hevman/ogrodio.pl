"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { t } from "@/i18n";
import { searchWeatherLocations, type WeatherLocationResult } from "@/lib/garden-api";

type Props = {
  value: { city: string; region: string; latitude: number | null; longitude: number | null };
  onChange: (location: { city: string; region: string; latitude: number; longitude: number }) => void;
};

export function WeatherLocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState(value.city);
  const [results, setResults] = useState<WeatherLocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value.city);
  }, [value.city, value.region]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed === value.city) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      searchWeatherLocations(trimmed)
        .then((data) => {
          setResults(data.locations);
          setOpen(true);
        })
        .catch((err) => {
          setResults([]);
          setError(err instanceof Error ? err.message : t("settings.locationSearchFailed"));
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, value.city]);

  function selectLocation(location: WeatherLocationResult) {
    onChange({
      city: location.name,
      region: location.region,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setQuery(location.name);
    setOpen(false);
    setResults([]);
  }

  const selectedLabel = value.city
    ? value.region
      ? `${value.city}, ${value.region}`
      : value.city
    : "";

  return (
    <div className="grid gap-2" ref={containerRef}>
      <label className="text-xs font-black uppercase text-slate-500">{t("settings.weatherLocationLabel")}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm font-bold outline-none focus:border-emerald-600"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => results.length && setOpen(true)}
          placeholder={t("settings.weatherLocationPlaceholder")}
          value={query}
        />
        {open && (loading || results.length > 0 || error) ? (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <p className="px-3 py-3 text-sm font-bold text-slate-500">{t("settings.locationSearching")}</p>
            ) : null}
            {error ? (
              <p className="px-3 py-3 text-sm font-bold text-red-700">{error}</p>
            ) : null}
            {!loading && !error
              ? results.map((location) => (
                  <button
                    className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-emerald-50"
                    key={`${location.name}-${location.region}-${location.latitude}`}
                    onClick={() => selectLocation(location)}
                    type="button"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="block text-sm font-black text-slate-950">{location.name}</span>
                      {location.region ? (
                        <span className="mt-0.5 block text-xs font-bold uppercase text-slate-500">{location.region}</span>
                      ) : null}
                    </span>
                  </button>
                ))
              : null}
            {!loading && !error && !results.length && query.trim().length >= 2 ? (
              <p className="px-3 py-3 text-sm font-bold text-slate-500">{t("settings.locationNoResults")}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      {selectedLabel && value.latitude !== null && value.longitude !== null ? (
        <p className="text-xs font-bold text-emerald-800">
          {t("settings.weatherLocationSelected", { location: selectedLabel })}
        </p>
      ) : (
        <p className="text-xs font-bold leading-5 text-slate-500">{t("settings.weatherLocationHint")}</p>
      )}
    </div>
  );
}
