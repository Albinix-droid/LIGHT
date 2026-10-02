// components/ui/Table.tsx
// Tableau de données : en-têtes discrets, lignes séparées par des filets, défilement horizontal sur mobile

import { cx } from "./kit";

export function Table({ children, minWidth = 760 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] text-ink" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children, align = "left", className = "" }: { children?: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th
      scope="col"
      className={cx(
        "border-b border-line bg-surface-muted px-4 py-3 text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap text-ink-subtle uppercase",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className = "" }: { children?: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return <td className={cx("border-b border-line px-4 py-3.5 align-middle", align === "right" && "text-right", className)}>{children}</td>;
}

export function Tr({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={cx("transition-colors last:[&>td]:border-b-0 hover:bg-surface-muted/60", className)}>{children}</tr>;
}
