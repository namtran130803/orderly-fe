type Props = {
  children: React.ReactNode;
};

export function OverviewSectionTitle({ children }: Props) {
  return (
    <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2 text-sm">
      {children}
    </h3>
  );
}
