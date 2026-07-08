import { faqItems } from "@/lib/site-config";

export function FaqList() {
  return (
    <div className="grid gap-3">
      {faqItems.map((item) => (
        <details
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-teal-200"
          key={item.question}
        >
          <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 marker:content-none">
            {item.question}
          </summary>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
