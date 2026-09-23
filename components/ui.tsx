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

const STAT_STYLES: Record<
  StatAccent,
  { bg: string; tile: string; glow: string; valueText: string }
> = {
  emerald: {
    bg: "from-emerald-500/25 via-emerald-500/5 to-transparent",
    tile: "from-emerald-400 to-teal-600",
    glow: "bg-emerald-400/30",
    valueText: "text-emerald-300",
  },
  red: {
    bg: "from-red-500/25 via-red-500/5 to-transparent",
    tile: "from-rose-500 to-red-600",
    glow: "bg-red-400/30",
    valueText: "text-red-300",
  },
  blue: {
    bg: "from-blue-500/25 via-blue-500/5 to-transparent",
    tile: "from-sky-400 to-blue-600",
    glow: "bg-blue-400/30",
    valueText: "text-sky-300",
  },
  amber: {
    bg: "from-amber-500/25 via-amber-500/5 to-transparent",
    tile: "from-amber-400 to-orange-600",
    glow: "bg-amber-400/30",
    valueText: "text-amber-300",
  },
  slate: {
    bg: "from-slate-500/25 via-slate-500/5 to-transparent",
    tile: "from-slate-300 to-slate-600",
    glow: "bg-slate-400/30",
    valueText: "text-slate-200",
  },
  violet: {
    bg: "from-violet-500/25 via-violet-500/5 to-transparent",
    tile: "from-violet-400 to-purple-600",
    glow: "bg-violet-400/30",
    valueText: "text-violet-300",
  },
};

export type StatAccent = "emerald" | "red" | "slate" | "blue" | "amber" | "violet";

export function StatCard({
  label,
  value,
  icon,
  sub,
  accent = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  sub?: React.ReactNode;
  accent?: StatAccent;
}) {
  const s = STAT_STYLES[accent];
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 shadow-lg",
        s.bg
      )}
    >
      <div
        className={classNames(
          "pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl",
          s.glow
        )}
      />
      {icon ? (
        <div
          className={classNames(
            "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            s.tile
          )}
        >
          {icon}
        </div>
      ) : null}
      <p className="relative mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={classNames(
          "relative mt-1 truncate text-2xl font-extrabold tracking-tight",
          s.valueText
        )}
      >
        {value}
      </p>
      {sub ? (
        <p className="relative mt-1.5 text-xs text-slate-400">{sub}</p>
      ) : null}
    </div>
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