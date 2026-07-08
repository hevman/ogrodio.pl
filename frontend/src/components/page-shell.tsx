import { Breadcrumb } from "@/components/breadcrumb";
import { siteContainer, siteGutter } from "@/lib/layout";

export function PageShell({
  breadcrumb,
  children,
  description,
  eyebrow,
  title,
}: {
  breadcrumb?: { href?: string; label: string }[];
  children?: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <section className={`border-b border-slate-200 bg-white py-10 sm:py-12 ${siteGutter}`}>
        <div className={siteContainer}>
          {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
          <span
            className={`inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 ${breadcrumb ? "mt-5" : ""}`}
          >
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>
        </div>
      </section>
      {children}
    </>
  );
}

export function PageSection({ children }: { children: React.ReactNode }) {
  return (
    <section className={`py-12 ${siteGutter}`}>
      <div className={siteContainer}>{children}</div>
    </section>
  );
}

export function PageCta({
  buttonHref,
  buttonLabel,
  text,
}: {
  buttonHref: string;
  buttonLabel: string;
  text: string;
}) {
  return (
    <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">{text}</p>
      <a
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
        href={buttonHref}
      >
        {buttonLabel}
      </a>
    </div>
  );
}
