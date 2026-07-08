import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedAdvice } from "@/lib/advice";
import { siteContainer, siteGutter } from "@/lib/layout";
import { AdviceCard } from "@/components/advice-card";

export async function HomeAdviceSection() {
  const featured = await getFeaturedAdvice(3);

  return (
    <section className={`border-t border-slate-200 bg-white py-16 ${siteGutter}`}>
      <div className={siteContainer}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
              Porady
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Praktyczne poradniki
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Evergreen — bez dat publikacji, za to z konkretnymi wskazówkami na cały
              sezon. Aktualizujemy, gdy zmieniają się praktyki lub ceny.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            href="/porady"
          >
            Wszystkie porady
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 xl:gap-8">
          {featured.map((article) => (
            <AdviceCard article={article} key={article.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
