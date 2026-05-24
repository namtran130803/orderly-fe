import type { ReactNode } from "react";

type Props = {
  label: string;
  value?: string | number | null;
  children?: ReactNode;
  trailing?: ReactNode;
  title?: string;
};

export function OverviewStatRow({
  label,
  value,
  children,
  trailing,
  title,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span
        className="text-sm font-medium text-(--color-text-emphasis) min-w-0"
        title={title}
      >
        {label}
      </span>
      <div className="flex flex-col items-end gap-1 min-w-0 text-right">
        <span className="text-sm">
          {children !== undefined ? (
            children
          ) : (
            <span className="font-semibold tabular-nums text-(--color-text-main)">
              {value}
            </span>
          )}
        </span>
        {trailing !== undefined ? trailing : null}
      </div>
    </div>
  );
}
