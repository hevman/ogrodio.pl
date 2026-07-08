"use client";

import Link from "next/link";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/i18n";
import { fetchGardenWeather, type GardenNotification, type GardenWeatherDay } from "@/lib/garden-api";
import { formatWeatherDay, weatherCodeLabel, weatherEmoji } from "@/lib/weather-utils";

type WeatherState = {
  locationLabel: string | null;
  current: {
    temperature: number;
    weatherCode: number;
    precipitation: number;
    windSpeed: number;
  } | null;
  forecast: GardenWeatherDay[];
  alerts: GardenNotification[];
};

export function WeatherForecastCard() {
  const [weather, setWeather] = useState<WeatherState | null>(null);

  useEffect(() => {
    fetchGardenWeather()
      .then((data) => setWeather({
        locationLabel: data.locationLabel,
        current: data.current,
        forecast: data.forecast,
        alerts: data.alerts,
      }))
      .catch(() => setWeather(null));
  }, []);

  if (!weather) return null;

  const today = weather.forecast[0];
  const hasForecast = Boolean(today);

  if (!weather.locationLabel && !hasForecast) {
    const alert = weather.alerts[0];
    if (!alert) return null;
    return (
      <section className="mb-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
        <Link className="block transition hover:opacity-90" href={alert.href || "/ustawienia"}>
          <p className="text-sm font-black text-sky-950">{alert.title}</p>
          <p className="mt-1 text-sm leading-6 text-sky-900">{alert.description}</p>
        </Link>
      </section>
    );
  }

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm">
      <div className="border-b border-sky-100 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-sky-800">
              <CloudSun className="h-4 w-4" />
              {t("app.weather.title")}
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-950">{weather.locationLabel}</h2>
          </div>
          {weather.current ? (
            <div className="text-right">
              <p className="text-3xl font-black text-slate-950">
                {Math.round(weather.current.temperature)}°C
              </p>
              <p className="text-sm font-bold text-slate-600">
                {weatherEmoji(weather.current.weatherCode)} {weatherCodeLabel(weather.current.weatherCode)}
              </p>
            </div>
          ) : null}
        </div>
        {today ? (
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
            <span>{t("app.weather.todayRange", { min: Math.round(today.temperatureMin), max: Math.round(today.temperatureMax) })}</span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-4 w-4 text-sky-700" />
              {t("app.weather.precipitation", { amount: today.precipitation.toFixed(today.precipitation >= 10 ? 0 : 1) })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-4 w-4 text-sky-700" />
              {t("app.weather.wind", { speed: Math.round(today.windSpeedMax) })}
            </span>
          </div>
        ) : null}
      </div>

      {weather.forecast.length ? (
        <div className="grid grid-cols-7 divide-x divide-sky-100 overflow-x-auto">
          {weather.forecast.map((day) => (
            <div className="min-w-[4.5rem] px-2 py-3 text-center" key={day.date}>
              <p className="text-[11px] font-black uppercase text-slate-500">{formatWeatherDay(day.date)}</p>
              <p className="mt-1 text-lg">{weatherEmoji(day.weatherCode)}</p>
              <p className="mt-1 text-xs font-black text-slate-950">{Math.round(day.temperatureMax)}°</p>
              <p className="text-xs font-bold text-slate-500">{Math.round(day.temperatureMin)}°</p>
            </div>
          ))}
        </div>
      ) : null}

      {weather.alerts.length ? (
        <div className="grid gap-2 border-t border-sky-100 bg-sky-50/70 px-4 py-3 sm:px-5">
          {weather.alerts.slice(0, 2).map((alert) => (
            <Link
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 transition hover:border-sky-300"
              href={alert.href || "/ustawienia"}
              key={alert.id}
            >
              <p className="text-sm font-black text-sky-950">{alert.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-sky-900">{alert.description}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
