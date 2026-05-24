import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/utils/formatMoney";

import { CompareBadge } from "./CompareBadge";

type CompareBlockProps = {
  label: string;
  title?: string;
  /** Hiển thị khi chưa có số liệu */
  placeholder?: string;
};

type MoneyRowProps = CompareBlockProps & {
  pct: number | null | undefined;
  current: number | undefined;
  previous: number | null | undefined;
  valueClassName?: string;
};

export function CompareMoneyRow({
  label,
  title,
  pct,
  current,
  previous,
  valueClassName = "text-(--color-text-main)",
  placeholder = "…",
}: MoneyRowProps) {
  const [open, setOpen] = useState(false);
  const hasValue = typeof current === "number";
  const hasPrevious = typeof previous === "number";
  const canCompare = hasValue && hasPrevious;
  const display = hasValue ? formatMoney(current) : placeholder;
  const delta = canCompare ? current - previous : 0;

  return (
    <CompareRowShell
      label={label}
      title={title}
      open={open}
      canExpand={canCompare}
      onToggle={() => setOpen((v) => !v)}
      trigger={
        <>
          <span className={cn("font-semibold tabular-nums text-sm", valueClassName)}>
            {display}
          </span>
          {canCompare ? (
            <>
              <CompareBadge pct={pct} />
              <ChevronIcon open={open} />
            </>
          ) : null}
        </>
      }
    >
      {canCompare ? (
        <>
          <Row bold label="Này" value={formatMoney(current)} />
          <Row label="Trước" value={formatMoney(previous)} />
          <Row className="pt-1" label="Chênh" value={formatDeltaMoney(delta)} />
        </>
      ) : null}
    </CompareRowShell>
  );
}

type CountRowProps = CompareBlockProps & {
  pct: number | null | undefined;
  current: number | undefined;
  previous: number | null | undefined;
  valueClassName?: string;
  labels?: { current: string; previous: string };
};

export function CompareCountRow({
  label,
  title,
  pct,
  current,
  previous,
  valueClassName = "text-(--color-text-main)",
  placeholder = "…",
  labels = { current: "Kỳ này", previous: "Kỳ trước" },
}: CountRowProps) {
  const [open, setOpen] = useState(false);
  const hasValue = typeof current === "number";
  const hasPrevious = typeof previous === "number";
  const canCompare = hasValue && hasPrevious;
  const display = hasValue ? String(current) : placeholder;
  const delta = canCompare ? current - previous : 0;

  return (
    <CompareRowShell
      label={label}
      title={title}
      open={open}
      canExpand={canCompare}
      onToggle={() => setOpen((v) => !v)}
      trigger={
        <>
          <span className={cn("font-semibold tabular-nums text-sm", valueClassName)}>
            {display}
          </span>
          {canCompare ? (
            <>
              <CompareBadge pct={pct} />
              <ChevronIcon open={open} />
            </>
          ) : null}
        </>
      }
    >
      {canCompare ? (
        <>
          <Row bold label={labels.current} value={String(current)} />
          <Row label={labels.previous} value={String(previous)} />
          <Row className="pt-1" label="Chênh" value={formatDeltaCount(delta)} />
        </>
      ) : null}
    </CompareRowShell>
  );
}

function CompareRowShell({
  label,
  title,
  open,
  canExpand,
  onToggle,
  trigger,
  children,
}: {
  label: string;
  title?: string;
  open: boolean;
  canExpand: boolean;
  onToggle: () => void;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const triggerContent = (
    <span className="inline-flex items-center justify-end gap-1.5 flex-wrap">
      {trigger}
    </span>
  );

  const rowBody = (
    <>
      <span
        className="text-sm font-medium text-(--color-text-emphasis) min-w-0 text-left"
        title={title}
      >
        {label}
      </span>
      <span className="min-w-0 text-right shrink-0">{triggerContent}</span>
    </>
  );

  return (
    <div>
      {canExpand ? (
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-start justify-between gap-3 active:opacity-70"
          aria-expanded={open}
        >
          {rowBody}
        </button>
      ) : (
        <div className="flex items-start justify-between gap-3">{rowBody}</div>
      )}
      {canExpand && open ? (
        <div className="mt-2 pt-2 border-t border-(--color-border-main) text-xs tabular-nums space-y-1.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={17}
      className={cn(
        "text-(--color-text-secondary) shrink-0 transition-transform duration-150",
        open && "rotate-180",
      )}
      aria-hidden
    />
  );
}

function formatDeltaMoney(delta: number) {
  if (delta === 0) return <span className="text-(--color-text-secondary)">0 đ</span>;
  return (
    <span
      className={cn(
        "font-semibold",
        delta > 0 ? "text-(--color-success)" : "text-(--color-danger)",
      )}
    >
      {delta > 0 ? "+" : "−"}
      {formatMoney(Math.abs(delta))}
    </span>
  );
}

function formatDeltaCount(delta: number) {
  if (delta === 0) return <span className="text-(--color-text-secondary)">0</span>;
  return (
    <span
      className={cn(
        "font-semibold",
        delta > 0 ? "text-(--color-success)" : "text-(--color-danger)",
      )}
    >
      {delta > 0 ? "+" : "−"}
      {Math.abs(delta)}
    </span>
  );
}

function Row({
  label,
  value,
  bold,
  className,
}: {
  label: string;
  value: ReactNode;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between gap-3", className)}>
      <span className="text-(--color-text-secondary) shrink-0">{label}</span>
      <span className={cn(bold && "font-semibold", "text-(--color-text-main)")}>
        {value}
      </span>
    </div>
  );
}
