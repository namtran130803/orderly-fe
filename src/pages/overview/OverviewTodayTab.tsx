import { useQuery } from "@tanstack/react-query";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { todayVnDateString } from "@/lib/date-vn";
import { dashboardService } from "@/services/dashboard.service";

import { AlertsCard } from "./AlertsCard";
import { CompareMoneyRow } from "./CompareExpand";
import { OverviewBand, overviewListGroupClass } from "./OverviewBand";
import { OverviewSectionTitle } from "./OverviewSectionTitle";
import { OverviewStatRow } from "./OverviewStatRow";
import { StaffTodayCard } from "./StaffTodayCard";

type Props = { storeId: number };

const emptyStaffToday = {
  scheduledCount: 0,
  workingCount: 0,
  onShiftNow: [] as { employeeId: number; name: string }[],
  absentCount: 0,
  paidLeaveToday: 0,
  unpaidLeaveToday: 0,
};

export function OverviewTodayTab({ storeId }: Props) {
  const today = todayVnDateString();

  const opsQuery = useQuery({
    queryKey: ["dashboard", "operations", storeId],
    queryFn: async () => {
      const res = await dashboardService.getOperations(storeId);
      return res.data.data;
    },
  });

  const financeQuery = useQuery({
    queryKey: ["dashboard", "finance", storeId, today, today],
    queryFn: async () => {
      const res = await dashboardService.getFinance(storeId, today, today);
      return res.data.data;
    },
  });

  const staffQuery = useQuery({
    queryKey: ["dashboard", "staff", storeId, today, today],
    queryFn: async () => {
      const res = await dashboardService.getStaff(storeId, today, today);
      return res.data.data;
    },
  });

  const fetching =
    opsQuery.isFetching || financeQuery.isFetching || staffQuery.isFetching;

  const finance = financeQuery.data;
  const cmp = finance?.comparePrevious;
  const staffToday = staffQuery.data?.today ?? emptyStaffToday;

  return (
    <div className="relative">
      {fetching ? <LoadingOverlay /> : null}

      <AlertsCard ops={opsQuery.data ?? null} />

      <OverviewSectionTitle>Vận hành</OverviewSectionTitle>
      <div className={overviewListGroupClass}>
        <OverviewBand>
          <OverviewStatRow label="Đơn đang xử lý">
            <span className="font-semibold tabular-nums text-(--color-warning)">
              {opsQuery.data != null ? opsQuery.data.openOrderCount : "…"}
            </span>
          </OverviewStatRow>
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Bàn có đơn"
            value={
              opsQuery.data != null
                ? `${opsQuery.data.busyTables}/${opsQuery.data.totalTables}`
                : "…"
            }
          />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Món không phục vụ"
            value={
              opsQuery.data != null ? opsQuery.data.unavailableMenuCount : "…"
            }
          />
        </OverviewBand>
      </div>

      <OverviewSectionTitle>Tài chính hôm nay</OverviewSectionTitle>
      <div className={overviewListGroupClass}>
        <OverviewBand>
          <CompareMoneyRow
            label="Doanh thu"
            pct={cmp?.revenuePct}
            current={finance?.revenue}
            previous={cmp?.revenue}
            valueClassName="text-(--color-success)"
          />
        </OverviewBand>
        <OverviewBand>
          <CompareMoneyRow
            label="Chi tiêu"
            pct={cmp?.expensePct}
            current={finance?.expense}
            previous={cmp?.expense}
            valueClassName="text-(--color-danger)"
          />
        </OverviewBand>
        <OverviewBand>
          <CompareMoneyRow
            label="Lợi nhuận gộp"
            pct={cmp?.profitPct}
            current={finance?.profit}
            previous={cmp?.profit}
            valueClassName="text-(--color-primary)"
          />
        </OverviewBand>
      </div>

      <StaffTodayCard data={staffToday} />
    </div>
  );
}
