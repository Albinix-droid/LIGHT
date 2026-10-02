// components/ui/kit.tsx
// KIT DE COMPOSANTS LIGHT : boutons, cartes, en-têtes, badges, champs, onglets, états vides
// Tous les styles passent par les jetons de globals.css (clair / sombre automatiques).

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ============================================================
// BOUTONS
// ============================================================
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "gold";
type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-brand hover:bg-brand-strong",
  secondary: "border border-line bg-surface text-ink shadow-card hover:border-line-strong hover:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "border border-danger/25 bg-surface text-danger hover:border-danger/50 hover:bg-danger-soft",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand hover:text-white",
  gold: "bg-[linear-gradient(135deg,#e6c56f,#c9993a)] text-[#2a1d05] shadow-[0_8px_20px_-8px_rgba(201,153,58,0.7)] hover:brightness-105",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-[12.5px]",
  md: "h-10 gap-2 rounded-xl px-4 text-[13px]",
  lg: "h-12 gap-2 rounded-xl px-5 text-[14px]",
  icon: "size-10 rounded-xl",
  "icon-sm": "size-8 rounded-lg",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return cx(
    "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
}

// ============================================================
// CARTES ET MISE EN PAGE
// ============================================================
export function Card({
  children,
  className = "",
  padded = true,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  as?: "section" | "div" | "article" | "aside" | "li";
}) {
  return <Tag className={cx("rounded-[22px] border border-line bg-surface shadow-card", padded && "p-5 sm:p-6", className)}>{children}</Tag>;
}

export function CardHeader({
  title,
  icon: Icon,
  description,
  action,
  className = "",
}: {
  title: React.ReactNode;
  icon?: LucideIcon;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
          {Icon && <Icon className="size-[18px] text-brand" strokeWidth={1.75} aria-hidden="true" />}
          {title}
        </h2>
        {description && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-brand">
            <span aria-hidden="true">←</span> {back.label}
          </Link>
        )}
        {eyebrow && <p className="text-[12px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-[26px] leading-tight font-bold tracking-tight text-ink sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action, id }: { children: React.ReactNode; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 id={id} className="font-display text-[19px] font-semibold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

// ============================================================
// BADGES ET STATISTIQUES
// ============================================================
export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "gold";

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted ring-line",
  brand: "bg-brand-soft text-brand-ink ring-brand/15",
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/15",
  danger: "bg-danger-soft text-danger ring-danger/15",
  gold: "bg-gold-soft text-gold ring-gold/20",
};

export function Badge({ tone = "neutral", children, icon: Icon, className = "" }: { tone?: Tone; children: React.ReactNode; icon?: LucideIcon; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap ring-1 ring-inset", TONE_CLASSES[tone], className)}>
      {Icon && <Icon className="size-3" strokeWidth={2} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function IconTile({ icon: Icon, tone = "brand", size = "md" }: { icon: LucideIcon; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "size-8 rounded-lg [&_svg]:size-4" : size === "lg" ? "size-12 rounded-2xl [&_svg]:size-[22px]" : "size-10 rounded-xl [&_svg]:size-5";
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center", dims, TONE_CLASSES[tone].replace(/ring-\S+/g, ""))}>
      <Icon strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

export function StatCard({
  icon,
  tone = "brand",
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon;
  tone?: Tone;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <IconTile icon={icon} tone={tone} />
      <p className="mt-4 font-display text-[28px] leading-none font-bold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
      {hint && <p className="mt-1 text-[12px] text-ink-subtle">{hint}</p>}
    </>
  );
  const cls = "block rounded-[22px] border border-line bg-surface p-5 shadow-card";
  return href ? (
    <Link href={href} className={cx(cls, "transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function ProgressBar({ value, className = "", tone = "brand" }: { value: number; className?: string; tone?: "brand" | "success" | "gold" }) {
  const fill = tone === "success" ? "bg-success" : tone === "gold" ? "bg-[linear-gradient(90deg,#c9993a,#e6c56f)]" : "bg-[linear-gradient(90deg,#1f4fd8,#4d86f7)]";
  return (
    <div className={cx("h-1.5 overflow-hidden rounded-full bg-surface-muted", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full rounded-full transition-[width] duration-500", fill)} style={{ width: `${Math.min(100, Math.max(value, value > 0 ? 3 : 0))}%` }} />
    </div>
  );
}

// ============================================================
// ÉTATS VIDES ET MESSAGES
// ============================================================
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center rounded-[22px] border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center", className)}>
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
        <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({ tone = "brand", icon: Icon, title, children, className = "" }: { tone?: Tone; icon?: LucideIcon; title?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("flex gap-3 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed ring-1 ring-inset", TONE_CLASSES[tone], className)}>
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
    </div>
  );
}

// ============================================================
// CHAMPS DE FORMULAIRE
// ============================================================
export const inputClass = cx(
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink shadow-[inset_0_1px_1px_rgba(16,24,40,0.03)]",
  "placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-150",
  "hover:border-line-strong focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted",
);

export const textareaClass = cx(inputClass, "min-h-[110px] resize-y leading-relaxed");

export const selectClass = cx(inputClass, "select-chevron cursor-pointer appearance-none pr-10");

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className = "",
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="text-danger" aria-hidden="true">*</span>}
        {optional && <span className="font-normal text-ink-subtle">(facultatif)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] text-danger" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

// ============================================================
// ONGLETS (segmentés)
// ============================================================
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  className = "",
}: {
  items: { value: T; label: React.ReactNode; count?: number; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cx("flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 shadow-card", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors",
              active ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            {item.icon && <item.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />}
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className={cx("rounded-full px-1.5 text-[10.5px] font-bold tabular-nums", active ? "bg-white/20 text-white" : "bg-surface-muted text-ink-muted")}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Variante en liens (filtres portés par l'URL)
export function LinkTabs({
  items,
  activeHref,
  label,
  className = "",
}: {
  items: { href: string; label: React.ReactNode; count?: number }[];
  activeHref: string;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cx("flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 shadow-card", className)}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors",
              active ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className={cx("rounded-full px-1.5 text-[10.5px] font-bold tabular-nums", active ? "bg-white/20 text-white" : "bg-surface-muted text-ink-muted")}>{item.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// Champ de recherche (formulaire GET : le terme est porté par l'URL)
export function SearchForm({
  action,
  defaultValue,
  placeholder,
  hidden = {},
  className = "",
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
  hidden?: Record<string, string | undefined>;
  className?: string;
}) {
  return (
    <form action={action} role="search" className={cx("relative", className)}>
      {Object.entries(hidden).map(([name, value]) => (value ? <input key={name} type="hidden" name={name} value={value} /> : null))}
      <svg className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input name="q" defaultValue={defaultValue} placeholder={placeholder} aria-label={placeholder} className={cx(inputClass, "h-10 py-0 pl-10 shadow-card")} />
    </form>
  );
}

// ============================================================
// FENÊTRE MODALE
// ============================================================
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-[#050912]/55 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={cx("flex max-h-[calc(100vh-24px)] w-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface text-ink shadow-raised animate-rise", width)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-line px-6 py-5">
          {Icon && <IconTile icon={Icon} />}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[17px] font-semibold">{title}</h2>
            {description && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className={buttonClass("ghost", "icon-sm")} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-line bg-surface-muted px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
