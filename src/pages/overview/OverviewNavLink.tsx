import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  to: string;
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export function OverviewNavLink({
  to,
  label,
  icon: Icon,
  iconClassName = "text-(--color-primary)",
}: Props) {
  return (
    <Link
      to={to}
      className="w-full px-4 py-3 flex items-center justify-between active:opacity-70"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={iconClassName} size={20} aria-hidden />
        <span className="text-sm text-(--color-text-main) font-medium">{label}</span>
      </div>
      <ChevronRight
        size={20}
        className="text-(--color-text-placeholder) shrink-0"
        aria-hidden
      />
    </Link>
  );
}
