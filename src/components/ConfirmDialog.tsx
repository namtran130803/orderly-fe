import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type ConfirmDialogVariant = "danger" | "warning" | "success";

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantClass: Record<
  ConfirmDialogVariant,
  { icon: typeof AlertTriangle; iconClass: string; confirmClass: string }
> = {
  danger: {
    icon: AlertTriangle,
    iconClass: "text-(--color-danger)",
    confirmClass: "text-(--color-danger)",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-(--color-warning)",
    confirmClass: "text-(--color-warning)",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-(--color-success)",
    confirmClass: "text-(--color-success)",
  },
};

export const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const { icon: Icon, iconClass, confirmClass } = variantClass[variant];

  return (
    <div
      className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-(--color-bg-surface) rounded-lg w-full max-w-sm shadow-lg overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center gap-1">
          <Icon size={36} className={`${iconClass} mb-1`} aria-hidden />
          <h3 className="text-[17px] font-semibold text-(--color-text-main) leading-snug">
            {title}
          </h3>
          <p className="text-[13px] text-(--color-text-secondary) leading-normal">
            {description}
          </p>
        </div>

        <div className="border-t border-(--color-border-main) flex">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 text-sm font-semibold text-(--color-text-main)"
          >
            {cancelText}
          </button>
          <div className="w-px bg-(--color-border-main)" />
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 h-11 text-sm font-semibold ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
