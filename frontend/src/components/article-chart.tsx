"use client";

// ─── Wykres Gantt: kalendarz dojrzewania ──────────────────────────────────────

export type GanttRow = {
  name: string;
  group: string;
  start: number;
  end: number;
};

export type GanttMonth = {
  label: string;
  weeks: number;
};

const GROUP_COLORS: Record<string, string> = {
  "wczesna":          "bg-emerald-400",
  "średnio-wczesna":  "bg-teal-500",
  "średnia":          "bg-blue-500",
  "późna":            "bg-violet-500",
  "wiosna":           "bg-lime-400",
  "lato":             "bg-amber-400",
  "jesień":           "bg-orange-400",
  "zima":             "bg-sky-300",
  "warzywa":          "bg-emerald-400",
  "zioła":            "bg-teal-400",
  "owoce":            "bg-amber-400",
  "kwiaty":           "bg-pink-400",
};
const GROUP_TEXT: Record<string, string> = {
  "wczesna":          "text-emerald-700 bg-emerald-50 border-emerald-200",
  "średnio-wczesna":  "text-teal-700 bg-teal-50 border-teal-200",
  "średnia":          "text-blue-700 bg-blue-50 border-blue-200",
  "późna":            "text-violet-700 bg-violet-50 border-violet-200",
  "wiosna":           "text-lime-700 bg-lime-50 border-lime-200",
  "lato":             "text-amber-700 bg-amber-50 border-amber-200",
  "jesień":           "text-orange-700 bg-orange-50 border-orange-200",
  "zima":             "text-sky-700 bg-sky-50 border-sky-200",
  "warzywa":          "text-emerald-700 bg-emerald-50 border-emerald-200",
  "zioła":            "text-teal-700 bg-teal-50 border-teal-200",
  "owoce":            "text-amber-700 bg-amber-50 border-amber-200",
  "kwiaty":           "text-pink-700 bg-pink-50 border-pink-200",
};

function getGroupColor(group: string) {
  return GROUP_COLORS[group] ?? "bg-slate-400";
}
function getGroupText(group: string) {
  return GROUP_TEXT[group] ?? "text-slate-600 bg-slate-50 border-slate-200";
}

export function ArticleGanttChart({ rows, months, title, subtitle }: {
  rows: GanttRow[];
  months: GanttMonth[];
  title?: string;
  subtitle?: string;
}) {
  const totalWeeks = months.reduce((s, m) => s + m.weeks, 0);
  const groups = Array.from(new Set(rows.map(r => r.group)));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{title ?? "Kalendarz"}</h2>
      {subtitle && <p className="text-sm text-slate-500 mb-5">{subtitle}</p>}

      <ul className="sr-only">
        {rows.map(r => (
          <li key={r.name}>{r.name} ({r.group}): tygodnie {r.start}–{r.end}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 mb-5">
        {groups.map(g => (
          <span key={g} className={`text-xs font-semibold px-3 py-1 rounded-full border ${getGroupText(g)}`}>
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </span>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto" role="img" aria-label={title ?? "Wykres Gantt"}>
        <div className="min-w-[500px]">
          <div className="flex mb-1">
            <div className="w-36 shrink-0" />
            {months.map(m => (
              <div
                key={m.label}
                className="text-xs font-bold text-slate-500 uppercase tracking-wide text-center border-l border-slate-200"
                style={{ width: `${(m.weeks / totalWeeks) * 100}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>
          {groups.map(group => (
            <div key={group} className="mb-4">
              <p className={`text-xs font-bold uppercase tracking-wide mb-2 px-2 py-0.5 rounded w-fit ${getGroupText(group)}`}>
                {group}
              </p>
              {rows.filter(r => r.group === group).map(row => {
                const leftPct = (row.start / totalWeeks) * 100;
                const widthPct = ((row.end - row.start) / totalWeeks) * 100;
                return (
                  <div key={row.name} className="flex items-center mb-1.5">
                    <div className="w-36 shrink-0 text-sm text-slate-700 font-medium pr-3 truncate">{row.name}</div>
                    <div className="flex-1 relative h-7 bg-slate-100 rounded-full">
                      {Array.from({ length: totalWeeks }).map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-200" style={{ left: `${(i / totalWeeks) * 100}%` }} />
                      ))}
                      <div
                        className={`absolute top-1 bottom-1 rounded-full ${getGroupColor(group)} opacity-90`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="sm:hidden space-y-2">
        {groups.map(group => (
          <div key={group}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-2 px-2 py-0.5 rounded w-fit ${getGroupText(group)}`}>
              {group}
            </p>
            <div className="space-y-1.5 mb-3">
              {rows.filter(r => r.group === group).map(row => {
                const startMonth = months[Math.floor(row.start / (totalWeeks / months.length))]?.label ?? "";
                const endMonth = months[Math.min(Math.floor(row.end / (totalWeeks / months.length)), months.length - 1)]?.label ?? "";
                const period = startMonth === endMonth ? startMonth : `${startMonth} – ${endMonth}`;
                return (
                  <div key={row.name} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${getGroupColor(group)}`} />
                    <span className="text-sm font-medium text-slate-800 flex-1">{row.name}</span>
                    <span className="text-xs text-slate-500">{period}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tabela porównawcza odmian ────────────────────────────────────────────────

export type VarietyTableRow = {
  name: string;
  group: string;
  harvest: string;
  fruitSize: string;
  taste: string;
  yield: string;
  notes?: string;
};

type VarietyColumnLabels = [string, string, string, string, string, string, string];

function varietyFieldRows(row: VarietyTableRow, labels: VarietyColumnLabels) {
  return [
    { label: labels[1], value: row.group, badge: true },
    { label: labels[2], value: row.harvest },
    { label: labels[3], value: row.fruitSize },
    { label: labels[4], value: row.taste },
    { label: labels[5], value: row.yield },
    { label: labels[6], value: row.notes || "—" },
  ];
}

export function ArticleVarietyTable({ rows, caption, tableIntro, columns }: {
  rows: VarietyTableRow[];
  caption?: string;
  tableIntro?: string;
  columns?: VarietyColumnLabels;
}) {
  const labels = columns ?? [
    "Odmiana", "Termin", "Zbiór", "Owoc", "Smak", "Plon", "Uwagi",
  ] as VarietyColumnLabels;
  const [c0, c1, c2, c3, c4, c5, c6] = labels;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {(caption || tableIntro) && (
        <div className="px-4 pt-6 pb-2 sm:px-6">
          {caption && <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{caption}</h2>}
          {tableIntro && <p className="mt-2 text-sm leading-6 text-slate-600">{tableIntro}</p>}
        </div>
      )}

      {/* Tekst dla SEO i czytników ekranu */}
      <ul className="sr-only">
        {rows.map((row) => (
          <li key={row.name}>
            {row.name}: {c1} {row.group}, {c2} {row.harvest}, {c3} {row.fruitSize}, {c4} {row.taste}, {c5} {row.yield}
            {row.notes ? `, ${c6} ${row.notes}` : ""}
          </li>
        ))}
      </ul>

      {/* Mobile: karty zamiast przewijanej tabeli */}
      <div className="space-y-3 px-4 pb-5 sm:hidden">
        {rows.map((row) => (
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4" key={row.name}>
            <h3 className="text-base font-bold text-slate-900">{row.name}</h3>
            <dl className="mt-3 space-y-2.5">
              {varietyFieldRows(row, labels).map((field) => (
                <div className="flex items-start justify-between gap-3 text-sm" key={field.label}>
                  <dt className="shrink-0 font-semibold text-slate-500">{field.label}</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {field.badge ? (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${getGroupText(row.group)}`}>
                        {row.group}
                      </span>
                    ) : (
                      field.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      {/* Desktop: pełna tabela */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">{caption ?? "Tabela porównawcza"}</caption>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 z-10 bg-slate-50 text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c0}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c1}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c2}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c3}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c4}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c5}</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700" scope="col">{c6}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <th className="sticky left-0 z-10 bg-inherit px-4 py-3 text-left font-semibold text-slate-900" scope="row">{row.name}</th>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getGroupText(row.group)}`}>
                    {row.group}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.harvest}</td>
                <td className="px-4 py-3 text-slate-600">{row.fruitSize}</td>
                <td className="px-4 py-3 text-slate-600">{row.taste}</td>
                <td className="px-4 py-3 text-slate-600">{row.yield}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{row.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
