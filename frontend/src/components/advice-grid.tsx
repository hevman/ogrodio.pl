import { AdviceCard } from "@/components/advice-card";
import type { AdviceArticle } from "@/lib/advice-types";
import { articleCategories } from "@/lib/site-config";

export function AdviceGrid({ articles, categorySlug }: { articles: AdviceArticle[]; categorySlug?: string }) {
  if (articles.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="text-lg">Brak artykułów do wyświetlenia.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
      {articles.map((article) => {
        const slug = categorySlug ?? articleCategories.find(c => c.topic === article.topic)?.slug;
        return (
          <AdviceCard article={article} categorySlug={slug} key={article.slug} />
        );
      })}
    </div>
  );
}
