import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/cn";

type Props = { pct: number | null | undefined };

export function CompareBadge({ pct }: Props) {
  if (pct == null || Number.isNaN(pct)) return null;

  const flat = pct === 0;
  const up = pct > 0;
  const Icon = flat ? null : up ? TrendingUp : TrendingDown;

  const text = flat
    ? "±0%"
    : `${pct > 0 ? "+" : ""}${pct.toLocaleString("vi-VN", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      })}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
        flat && "text-(--color-text-secondary)",
        !flat && up && "text-(--color-success)",
        !flat && !up && "text-(--color-danger)",
      )}
    >
      {Icon ? <Icon size={14} aria-hidden /> : null}
      {text}
    </span>
  );
}
