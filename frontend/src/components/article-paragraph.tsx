import Link from "next/link";
import { parseInlineLinks } from "@/lib/article-inline-links";

type Props = {
  text: string;
};

export function ArticleParagraph({ text }: Props) {
  const parts = parseInlineLinks(text);

  return (
    <p className="text-base leading-7 text-slate-600">
      {parts.map((part, index) =>
        part.type === "link" ? (
          <Link
            className="font-semibold text-teal-700 underline decoration-teal-200 underline-offset-2 transition hover:text-teal-900"
            href={part.href}
            key={`${part.href}-${index}`}
          >
            {part.label}
          </Link>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
}
