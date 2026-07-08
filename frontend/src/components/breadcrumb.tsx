import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
  variant = "light",
}: {
  items: { href?: string; label: string }[];
  variant?: "dark" | "light";
}) {
  const muted = variant === "dark" ? "text-slate-300" : "text-slate-500";
  const active = variant === "dark" ? "text-white" : "text-slate-800";
  const hover = variant === "dark" ? "hover:text-teal-200" : "hover:text-teal-700";
  const chevron = variant === "dark" ? "text-slate-500" : "text-slate-400";

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${muted}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronRight className={`h-3.5 w-3.5 ${chevron}`} /> : null}
            {item.href ? (
              <Link className={`font-medium transition ${hover}`} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold ${active}`}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
