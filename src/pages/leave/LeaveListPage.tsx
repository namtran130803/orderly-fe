import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Palmtree, ChevronRight, CirclePlus, MoveRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { leaveService } from "@/services/leave.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";

const TABS = [
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Từ chối" },
];

export const LeaveListPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const canList = usePerm(PERMS.leave.list);
  const [status, setStatus] = useState("PENDING");

  const swipeHandlers = useSwipeTabs({
    items: TABS,
    currentId: status,
    setCurrentId: setStatus,
  });

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(`leave-tab-${id}`);
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }, 50);
  };

  useEffect(() => {
    scrollTabIntoView(status);
  }, [status]);

  const { data, isLoading } = useQuery({
    queryKey: ["leaves", storeId, canList, status],
    queryFn: async () => {
      if (canList) {
        const res = await leaveService.list(storeId!, { status });
        return { items: res.data.data as any[], isAll: true };
      }
      const res = await leaveService.me(storeId!, { status });
      return { items: res.data.data as any[], isAll: false };
    },
    enabled: !!storeId,
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header title="Đơn nghỉ" Icon={Palmtree} backUrl={paths.settings.index}>
        <Link to={paths.leave.request} className="text-(--color-primary)">
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              id={`leave-tab-${tab.id}`}
              onClick={() => setStatus(tab.id)}
              className={cn(
                "px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2",
                isActive && "border-(--color-primary) text-(--color-primary)",
                !isActive && "border-transparent text-(--color-text-secondary)",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 relative" {...swipeHandlers}>
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto py-4">
            {!isLoading && (data?.items?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <Palmtree size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Chưa có đơn nghỉ</p>
              </div>
            )}
            {data?.items && data.items.length > 0 && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {data.items.map((row: any) => (
                  <Link
                    key={row.id}
                    to={paths.leave.detail(row.id)}
                    state={{ row }}
                    className="px-4 py-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {row.employee?.user?.name}
                      </div>
                      <div className="text-xs text-(--color-text-secondary) mt-1 flex items-center gap-2">
                        {row.fromDate?.slice?.(0, 10)}
                        <MoveRight size={12} />
                        {row.toDate?.slice?.(0, 10)}
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-(--color-text-placeholder)"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
