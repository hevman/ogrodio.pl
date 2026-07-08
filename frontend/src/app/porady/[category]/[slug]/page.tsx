import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Camera, CheckCircle2, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { ArticleGanttChart, ArticleVarietyTable } from "@/components/article-chart";
import { ArticleParagraph } from "@/components/article-paragraph";
import { formatArticleDate } from "@/lib/format-date";
import { ArticleInternalLinks } from "@/components/article-internal-links";
import { ArticleRelatedProducts } from "@/components/article-related-products";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageSection } from "@/components/page-shell";
import { t } from "@/i18n";
import { getAdviceArticle, getAdviceArticles, getAdviceDiscoverMeta } from "@/lib/advice";
import { buildArticleBodyText } from "@/lib/article-content";
import { getRelatedSectionTitle, resolveRelatedArticles } from "@/lib/article-links";
import { getAdviceRelatedProducts } from "@/lib/advice-shop";
import { siteShell } from "@/lib/layout";
import { site, articleCategories, getArticleCategorySlug } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 300;

type Props = { params: Promise<{ category: string; slug: string }> };

function absoluteSiteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return site.publicUrl;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${site.publicUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getAdviceArticle(slug);
  if (!article) return { title: "Porada" };
  const discoverMeta = getAdviceDiscoverMeta(article);
  const pagePath = `/porady/${category}/${slug}`;

  return {
    title: discoverMeta.headline,
    description: discoverMeta.description,
    keywords: article.seo.keywords,
    alternates: { canonical: pagePath },
    openGraph: {
      description: discoverMeta.description,
      images: [{ url: discoverMeta.image, alt: discoverMeta.imageAlt, width: 1200, height: 630 }],
      title: discoverMeta.headline,
      type: "article",
      url: pagePath,
    },
    twitter: {
      card: "summary_large_image",
      description: discoverMeta.description,
      images: [discoverMeta.image],
      title: discoverMeta.headline,
    },
  };
}

export default async function AdviceArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = await getAdviceArticle(slug);
  if (!article) notFound();

  const expectedCategorySlug = getArticleCategorySlug(article.topic);
  if (expectedCategorySlug && expectedCategorySlug !== category) {
    redirect(`/porady/${expectedCategorySlug}/${slug}`);
  }

  const articleCategory = articleCategories.find(c => c.slug === category);
  const articles = await getAdviceArticles();
  const internalLinks = resolveRelatedArticles(article, articles, 6);
  const relatedSectionTitle = getRelatedSectionTitle(article);
  const readMoreArticles = internalLinks.slice(0, 2);
  const relatedProducts = await getAdviceRelatedProducts(article, 3);

  const ganttRows = article.ganttChart?.rows ?? [];
  const tableRows = article.varietyTable?.rows ?? [];
  const faqItems = article.faq ?? [];
  const discoverMeta = getAdviceDiscoverMeta(article);
  const pageUrl = `${site.publicUrl}/porady/${category}/${article.slug}`;

  const articleBody = buildArticleBodyText(article);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    articleBody,
    author: {
      "@type": "Organization",
      name: site.authorName,
      url: `${site.publicUrl}/o-nas`,
    },
    dateModified: article.updatedAt,
    datePublished: discoverMeta.updatedAt,
    description: discoverMeta.description,
    headline: discoverMeta.headline,
    image: absoluteSiteUrl(discoverMeta.image),
    keywords: article.seo.keywords.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    publisher: { "@type": "Organization", name: site.name },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${site.publicUrl}/` },
      { "@type": "ListItem", position: 2, name: "Porady", item: `${site.publicUrl}/porady` },
      ...(articleCategory ? [{
        "@type": "ListItem",
        position: 3,
        name: articleCategory.label,
        item: `${site.publicUrl}/porady/${articleCategory.slug}`,
      }, {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: pageUrl,
      }] : [{
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: pageUrl,
      }]),
    ],
  };

  const faqJsonLd = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const jsonLd = faqJsonLd
    ? [articleJsonLd, breadcrumbJsonLd, faqJsonLd]
    : [articleJsonLd, breadcrumbJsonLd];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="relative min-h-[18rem] overflow-hidden bg-slate-900 text-white lg:min-h-[22rem]">
        <Image
          alt={article.coverAlt}
          className="object-cover opacity-75"
          fill
          priority
          sizes="100vw"
          src={article.coverImage}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        <div className={`relative flex min-h-[18rem] flex-col justify-end pb-10 pt-28 lg:min-h-[22rem] lg:pb-12 ${siteShell}`}>
          <Breadcrumb
            items={[
              { href: "/", label: "Start" },
              { href: "/porady", label: "Porady" },
              ...(articleCategory ? [{ href: `/porady/${articleCategory.slug}`, label: articleCategory.label }] : []),
              { label: article.title },
            ]}
            variant="dark"
          />
          <span className="mt-5 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-200 backdrop-blur">
            {article.topic}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            {article.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-teal-400" />
              {article.readingMinutes} min czytania
            </span>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-teal-400" />
              {site.authorName}
            </span>
            <span>Ostatnia aktualizacja: {formatArticleDate(article.updatedAt)}</span>
          </div>
        </div>
      </section>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="space-y-8">
            {article.sections.map((section: any, index: number) => (
              <div key={section.heading}>
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-slate-900">{section.heading}</h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph: string) => (
                      <ArticleParagraph key={paragraph} text={paragraph} />
                    ))}
                  </div>
                </section>
                {index === 2 && article.inlineImage ? (
                  <figure className="mt-8 overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                    <Image
                      alt={article.inlineImage.alt}
                      className="w-full object-cover"
                      height={600}
                      src={article.inlineImage.src}
                      unoptimized
                      width={1000}
                    />
                    <figcaption className="bg-slate-50 px-5 py-3 text-sm text-slate-500">
                      {article.inlineImage.alt}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            ))}

            {ganttRows.length > 0 ? (
              <ArticleGanttChart
                rows={ganttRows}
                months={article.ganttChart?.months ?? []}
                title={article.ganttChart?.title}
                subtitle={article.ganttChart?.subtitle}
              />
            ) : null}

            {tableRows.length > 0 ? (
              <ArticleVarietyTable
                rows={tableRows}
                caption={article.varietyTable?.caption}
                tableIntro={article.varietyTable?.tableIntro}
                columns={article.varietyTable?.columns}
              />
            ) : null}

            {internalLinks.length > 0 ? (
              <ArticleInternalLinks links={internalLinks} title={relatedSectionTitle} />
            ) : null}

            {faqItems.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">FAQ</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Najczęściej zadawane pytania
                </h2>
                <div className="mt-5 divide-y divide-slate-200">
                  {faqItems.map(item => (
                    <details className="group py-4" key={item.question}>
                      <summary className="cursor-pointer list-none text-base font-bold text-slate-900 marker:hidden">
                        <span className="flex items-start justify-between gap-4">
                          {item.question}
                          <span className="mt-1 text-lg leading-none text-teal-700 group-open:rotate-45">+</span>
                        </span>
                      </summary>
                      <p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Autor i źródła</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p className="flex gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <span>
                    Autor: <strong className="text-slate-900">{site.authorName}</strong>. Poradnik powstał jako materiał
                    praktyczny dla ogrodników i właścicieli ogrodów.
                  </span>
                </p>
                <p className="flex gap-3">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <span>Zdjęcia w artykule pochodzą z własnych materiałów {site.name}.</span>
                </p>
                <p className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <span>
                    Treść może być aktualizowana po nowych obserwacjach. Przy środkach ochrony roślin zawsze sprawdzaj
                    etykietę i aktualne zalecenia.
                  </span>
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="text-sm font-bold text-teal-700 transition hover:text-teal-800" href="/o-nas">
                  O nas
                </Link>
                <Link className="text-sm font-bold text-teal-700 transition hover:text-teal-800" href="/polityka-redakcyjna">
                  Polityka redakcyjna
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#eef1f6] p-6">
              <h2 className="text-lg font-bold text-slate-900">W skrócie</h2>
              <ul className="mt-4 space-y-3">
                {article.tips.map((tip: string) => (
                  <li className="flex gap-3 text-sm leading-6 text-slate-700" key={tip}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <ArticleRelatedProducts products={relatedProducts} topic={article.topic} />
          </aside>
        </div>

        {readMoreArticles.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-slate-900">{t("advice.readMore")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {readMoreArticles.map(item => (
                  <Link
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-md"
                    href={item.href}
                    key={item.slug}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      {item.topic}
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{item.title}</p>
                  </Link>
              ))}
            </div>
          </div>
        ) : null}
      </PageSection>
    </>
  );
}
