import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdviceGrid } from "@/components/advice-grid";
import { ArticleParagraph } from "@/components/article-paragraph";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageSection } from "@/components/page-shell";
import { getAdviceArticlesByTopic } from "@/lib/advice";
import { getCategoryIntro } from "@/lib/category-intros";
import { articleCategories, site } from "@/lib/site-config";
import { siteShell } from "@/lib/layout";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = articleCategories.find(c => c.slug === category);
  if (!cat) return { title: "Porady" };

  const intro = getCategoryIntro(category);
  const description = intro?.paragraphs[0]
    ?? `Praktyczne poradniki ogrodnicze z kategorii ${cat.label}. Uprawa, pielęgnacja i rozwiązywanie problemów w ogrodzie.`;

  return {
    title: `${cat.label} — Porady ogrodnicze | Ogrodio`,
    description,
    alternates: { canonical: `/porady/${category}` },
    openGraph: {
      title: `${cat.label} — Porady ogrodnicze`,
      description: `Praktyczne poradniki z kategorii ${cat.label}.`,
      type: "website",
      url: `/porady/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = articleCategories.find(c => c.slug === category);
  if (!cat) notFound();

  const articles = await getAdviceArticlesByTopic(cat.topic);

  // Kolejność miesięcy dla kategorii siewu
  const MONTH_ORDER: Record<string, number> = {
    'co-siejemy-w-styczniu': 1,
    'co-siejemy-w-lutym': 2,
    'co-siejemy-w-marcu': 3,
    'co-siejemy-w-kwietniu': 4,
    'co-siejemy-w-maju': 5,
    'co-siejemy-w-czerwcu': 6,
    'co-siejemy-w-lipcu': 7,
    'co-siejemy-w-sierpniu': 8,
    'co-siejemy-we-wrzesniu': 9,
    'co-siejemy-w-pazdzierniku': 10,
    'co-siejemy-w-listopadzie': 11,
    'co-siejemy-w-grudniu': 12,
  };

  const isSowingCategory = category === 'wysiew-nasion-i-sadzenie';

  const sortedArticles = isSowingCategory
    ? [...articles].sort((a, b) => {
        const orderA = MONTH_ORDER[a.slug] ?? 99;
        const orderB = MONTH_ORDER[b.slug] ?? 99;
        return orderA - orderB;
      })
    : articles;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${site.publicUrl}/` },
      { "@type": "ListItem", position: 2, name: "Porady", item: `${site.publicUrl}/porady` },
      { "@type": "ListItem", position: 3, name: cat.label, item: `${site.publicUrl}/porady/${category}` },
    ],
  };

  const count = sortedArticles.length;
  const countLabel = count === 1 ? "poradnik" : count < 5 ? "poradniki" : "poradników";
  const intro = getCategoryIntro(category);

  const collectionJsonLd = count > 0
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${cat.label} — Porady ogrodnicze`,
        description: intro?.paragraphs[0] ?? `Poradniki z kategorii ${cat.label}.`,
        url: `${site.publicUrl}/porady/${category}`,
        numberOfItems: count,
      }
    : null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
      {collectionJsonLd ? (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
          type="application/ld+json"
        />
      ) : null}

      <section className={`border-b border-slate-200 bg-white py-10 sm:py-12 ${siteShell}`}>
        <Breadcrumb
          items={[
            { href: "/", label: "Start" },
            { href: "/porady", label: "Porady" },
            { label: cat.label },
          ]}
        />
        <span className="mt-5 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
          Kategoria
        </span>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {cat.label}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {count > 0
            ? `${count} ${countLabel} z kategorii ${cat.label}.`
            : `Brak artykułów w kategorii ${cat.label}.`}
        </p>
        {intro ? (
          <div className="mt-6 max-w-3xl space-y-4 border-t border-slate-100 pt-6">
            {intro.paragraphs.map((paragraph) => (
              <ArticleParagraph key={paragraph.slice(0, 48)} text={paragraph} />
            ))}
            {intro.hub ? (
              <Link
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
                href={`/porady/${intro.hub.categorySlug}/${intro.hub.slug}`}
              >
                {intro.hub.linkLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <PageSection>
        <AdviceGrid articles={sortedArticles} categorySlug={category} />
      </PageSection>
    </>
  );
}
