import type { Metadata } from "next";
import { Suspense } from "react";
import { AdviceSearchResults } from "@/components/advice-search-results";

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania porad — Ogrodio",
  robots: { index: false, follow: false },
};

export default function AdviceSearchPage() {
  return (
    <Suspense>
      <AdviceSearchResults />
    </Suspense>
  );
}
