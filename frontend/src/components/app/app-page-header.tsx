type Props = {
  actions?: React.ReactNode;
  badge?: string;
  children?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function AppPageHeader({ actions, badge, children, subtitle, title }: Props) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge ? <p className="text-sm font-black uppercase text-emerald-700">{badge}</p> : null}
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
