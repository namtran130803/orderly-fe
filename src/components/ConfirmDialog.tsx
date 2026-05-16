import { AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-(--color-bg-surface) rounded-lg w-full max-w-sm shadow-lg overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center gap-1">
          {variant === "danger" && (
            <AlertTriangle size={36} className="text-(--color-danger) mb-1" />
          )}
          <h3 className="text-[17px] font-semibold text-(--color-text-main) leading-snug">
            {title}
          </h3>
          <p className="text-[13px] text-(--color-text-secondary) leading-normal">
            {description}
          </p>
        </div>

        <div className="border-t border-(--color-border-main) flex">
          <button
            onClick={onCancel}
            className="flex-1 h-11 text-sm font-semibold text-(--color-text-main)"
          >
            {cancelText}
          </button>
          <div className="w-px bg-(--color-border-main)" />
          <button
            onClick={onConfirm}
            className={`flex-1 h-11 text-sm font-semibold ${
              variant === "danger"
                ? "text-(--color-danger)"
                : "text-(--color-primary)"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
