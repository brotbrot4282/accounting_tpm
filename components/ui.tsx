import { classNames } from "@/lib/format";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1d] shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={classNames("p-5", className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

const TABLE_REGION: Record<string, string> = {
  transaksi: "bg-emerald-600 text-white",
  kas: "bg-blue-600 text-white",
  kategori: "bg-violet-600 text-white",
  kontak: "bg-amber-500 text-white",
};

export function StatCard({
  label,
  value,
  icon,
  accent = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "emerald" | "red" | "slate" | "blue" | "amber";
}) {
  const accents: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    red: "bg-red-500/15 text-red-400",
    slate: "bg-white/10 text-slate-300",
    blue: "bg-blue-500/15 text-blue-400",
    amber: "bg-amber-500/15 text-amber-400",
  };
  return (
    <Card className="flex items-center gap-4 p-5">
      {icon ? (
        <div
          className={classNames(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accents[accent]
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="truncate text-lg font-bold text-slate-100">{value}</p>
      </div>
    </Card>
  );
}

const BADGE_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400 ring-emerald-400/25",
  red: "bg-red-500/15 text-red-400 ring-red-400/25",
  slate: "bg-white/10 text-slate-300 ring-white/20",
  blue: "bg-blue-500/15 text-blue-400 ring-blue-400/25",
  violet: "bg-violet-500/15 text-violet-400 ring-violet-400/25",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-400/25",
};

export function Badge({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: "emerald" | "red" | "slate" | "blue" | "violet" | "amber";
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE_COLORS[color]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-slate-400">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-100">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}