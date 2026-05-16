import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  Icon?: React.ElementType;
  children?: React.ReactNode;
  backUrl?: string;
}

export const Header: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  Icon,
  children,
  backUrl,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-(--color-bg-surface) h-15 px-4 flex items-center justify-between gap-2 border-b border-(--color-border-main)">
      <div className="flex items-center gap-2">
        {/* Back button */}
        {backUrl && (
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(backUrl);
              }
            }}
            className="text-(--color-primary)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Icon */}
        {Icon && (
          <div className="text-(--color-primary)">
            <Icon size={24} />
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-(--color-text-main) truncate capitalize">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-(--color-text-secondary) truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right action */}
      {children}
    </div>
  );
};
