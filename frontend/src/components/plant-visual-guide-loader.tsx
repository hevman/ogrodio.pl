"use client";

import dynamic from "next/dynamic";
import type { PlantCatalogItem } from "@/lib/plant-catalog";

const PlantVisualGuide = dynamic(
  () => import("@/components/plant-visual-guide").then((mod) => mod.PlantVisualGuide),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Schemat uprawy</p>
        <div className="mt-4 h-72 animate-pulse rounded-xl bg-slate-100" />
      </section>
    ),
  },
);

export function PlantVisualGuideLoader({ plant }: { plant: PlantCatalogItem }) {
  return <PlantVisualGuide plant={plant} />;
}
