import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Khối list full chiều ngang — giống Quản lý / Settings. */
export const overviewListGroupClass =
  "bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)";

/** Một dòng trong khối list. */
export const overviewRowClass = "px-4 py-3";

type Props = {
  children: ReactNode;
  className?: string;
};

export function OverviewBand({ children, className }: Props) {
  return <div className={cn(overviewRowClass, className)}>{children}</div>;
}
