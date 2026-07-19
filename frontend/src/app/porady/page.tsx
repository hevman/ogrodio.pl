import type { Metadata } from "next";
import { AdviceDirectoryBrowser } from "@/components/advice-directory-browser";
import { PageShell, PageSection } from "@/components/page-shell";
import { getAdviceArticles } from "@/lib/advice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Porady ogrodnicze - Ogrodio",
  description: "Praktyczne poradniki ogrodnicze: uprawa roślin, choroby, szkodniki, trawnik, warzywnik i pielęgnacja ogrodu przez cały rok.",
  alternates: { canonical: "/porady" },
  openGraph: {
    title: "Porady ogrodnicze - Ogrodio",
    description: "Praktyczne poradniki ogrodnicze podzielone tematycznie.",
    type: "website",
    url: "/porady",
  },
};

export default async function AdvicePage() {
  const articles = await getAdviceArticles();
  const totalCount = articles.length;

  return (
    <PageShell
      breadcrumb={[{ href: "/", label: "Start" }, { label: "Porady" }]}
      description={`${totalCount} praktycznych poradników ogrodniczych podzielonych na kategorie tematyczne.`}
      eyebrow="Poradniki"
      title="Wiedza, która zostaje na lata"
    >
      <PageSection>
        <AdviceDirectoryBrowser articles={articles} />
      </PageSection>
    </PageShell>
  );
}
