export const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-(--color-bg-surface)/80">
    <div className="size-10 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
  </div>
);
