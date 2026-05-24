import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, CirclePlus, HandCoins, Loader, Sparkles } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatMoney } from "@/utils/formatMoney";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { expenseService, type Expense } from "@/services/expense.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";

export const ExpensesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const canCreate = usePerm(PERMS.expenses.create);
  const canUpdate = usePerm(PERMS.expenses.update);
  const canDelete = usePerm(PERMS.expenses.delete);
  const canAi = usePerm(PERMS.ai.expense_analyze) || usePerm(PERMS.ai.expense_generate);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["expenses", storeId],
      queryFn: async ({ pageParam }) => {
        const res = await expenseService.list(storeId!, {
          limit: 20,
          cursor: pageParam,
        });
        return res.data.data;
      },
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!storeId,
    });

  const expenses = data?.pages.flatMap((page) => page.items) || [];

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const { mutate: deleteExpense, isPending: isDeleting } = useMutation({
    mutationFn: (expenseId: number) =>
      expenseService.remove(storeId!, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", storeId] });
      setDeleteTarget(null);
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const groupedExpenses = expenses.reduce(
    (acc: Record<string, Expense[]>, expense: Expense) => {
      const dateKey = expense.rawDate.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(expense);
      return acc;
    },
    {},
  );

  const groupDates = Object.keys(groupedExpenses).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="flex-1 flex flex-col relative">
      {(isLoading || isDeleting) && <LoadingOverlay />}
      <Header Icon={HandCoins} title="Chi tiêu">
        <div className="flex items-center gap-3">
          {canAi && (
            <Link to={paths.expenses.ai} className="text-(--color-primary)">
              <Sparkles size={24} />
            </Link>
          )}
          {canCreate && (
            <Link to={paths.expenses.create} className="text-(--color-primary)">
              <CirclePlus size={24} />
            </Link>
          )}
        </div>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && expenses.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <HandCoins size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có chi tiêu nào</p>
              </div>
            )}
            {!isLoading &&
              groupDates.map((dateKey) => {
                const [y, m, d] = dateKey.split("-").map(Number);
                const dateLabel = new Date(y, m - 1, d).toLocaleDateString(
                  "vi-VN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                );

                return (
                  <div key={dateKey}>
                    <div className="sticky top-0 z-10 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
                      <h3 className="text-sm font-semibold text-(--color-text-secondary) p-4 pb-2">
                        {dateLabel}
                      </h3>
                    </div>

                    <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                      {groupedExpenses[dateKey].map((expense) => (
                        <div
                          key={expense.id}
                          className="px-4 py-3 flex items-center justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <h4 className="font-medium truncate">
                              {expense.title}
                            </h4>
                            <span className="text-(--color-danger) font-medium">
                              {formatMoney(expense.amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            {canUpdate && (
                              <Link
                                to={paths.expenses.edit(expense.id)}
                                state={{ expense }}
                                className="text-(--color-warning)"
                              >
                                <Pencil size={20} />
                              </Link>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget(expense)}
                                className="text-(--color-danger)"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            <div ref={sentinelRef} className="h-4" />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader
                  size={20}
                  className="animate-spin text-(--color-primary)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={`Xóa ${deleteTarget?.title}`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteExpense(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
