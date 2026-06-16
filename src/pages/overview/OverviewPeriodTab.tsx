import { useQuery } from "@tanstack/react-query";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { cn } from "@/lib/cn";
import type { OverviewPeriodPreset } from "@/lib/date-vn";
import { dashboardService } from "@/services/dashboard.service";
import { formatMoney } from "@/utils/formatMoney";

import {
  CompareCountRow,
  CompareMoneyRow,
} from "./CompareExpand";
import { OverviewBand, overviewListGroupClass } from "./OverviewBand";
import { OverviewSectionTitle } from "./OverviewSectionTitle";
import { OverviewStatRow } from "./OverviewStatRow";
import { StatusPipeline } from "./StatusPipeline";
import { TopItemsList } from "./TopItemsList";

type Props = {
  storeId: number;
  from: string;
  to: string;
  periodPreset: OverviewPeriodPreset;
};

function overviewPeriodSubtitle(
  preset: OverviewPeriodPreset,
  from: string,
  to: string,
): string {
  const d1 = vnLabel(from);
  const d2 = vnLabel(to);
  switch (preset) {
    case "today":
      return d1.full;
    case "yesterday":
      return `Hôm qua — ${d1.short}`;
    case "thisWeek":
      return `Tuần này (${d1.short} → ${d2.short})`;
    case "lastWeek":
      return `Tuần trước (${d1.short} → ${d2.short})`;
    case "thisMonth":
      return `Tháng này (${d1.short} → ${d2.short})`;
    case "lastMonth":
      return `Tháng trước (${d1.short} → ${d2.short})`;
    default:
      return `${d1.short} → ${d2.short}`;
  }
}

function vnLabel(ymd: string): { short: string; full: string } {
  const d = new Date(`${ymd}T12:00:00+07:00`);
  const short = d.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const full = d.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return { short, full };
}

function hourBandLabel(h: number): string {
  if (h === 23) return "23h → 24h";
  return `${h}h → ${h + 1}h`;
}

void overviewPeriodSubtitle;

export function OverviewPeriodTab({
  storeId,
  from,
  to,
  periodPreset,
}: Props) {
  void periodPreset;
  const financeQuery = useQuery({
    queryKey: ["dashboard", "finance", storeId, from, to],
    queryFn: async () => {
      const res = await dashboardService.getFinance(storeId, from, to);
      return res.data.data;
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["dashboard", "orders", storeId, from, to],
    queryFn: async () => {
      const res = await dashboardService.getOrders(storeId, from, to);
      return res.data.data;
    },
  });

  const staffQuery = useQuery({
    queryKey: ["dashboard", "staff", storeId, from, to],
    queryFn: async () => {
      const res = await dashboardService.getStaff(storeId, from, to);
      return res.data.data;
    },
  });

  const fetching =
    financeQuery.isFetching || ordersQuery.isFetching || staffQuery.isFetching;

  const finance = financeQuery.data;
  const financeCmp = finance?.comparePrevious;
  const orders = ordersQuery.data;
  const ordersCmp = orders?.comparePrevious;
  const staffPeriod = staffQuery.data?.period;

  const peakHours = [...(orders?.ordersByHour ?? [])]
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .filter((row) => row.count > 0)
    .slice(0, 8);

  return (
    <div className="">
      {fetching ? <LoadingOverlay /> : null}

      <OverviewSectionTitle>Tài chính</OverviewSectionTitle>
      <div className={overviewListGroupClass}>
        <OverviewBand>
          <CompareMoneyRow
            label="Doanh thu"
            pct={financeCmp?.revenuePct}
            current={finance?.revenue}
            previous={financeCmp?.revenue}
            valueClassName="text-(--color-success)"
          />
        </OverviewBand>
        <OverviewBand>
          <CompareMoneyRow
            label="Chi tiêu"
            pct={financeCmp?.expensePct}
            current={finance?.expense}
            previous={financeCmp?.expense}
            valueClassName="text-(--color-danger)"
          />
        </OverviewBand>
        <OverviewBand>
          <CompareMoneyRow
            label="Lợi nhuận gộp"
            pct={financeCmp?.profitPct}
            current={finance?.profit}
            previous={financeCmp?.profit}
            valueClassName="text-(--color-primary)"
          />
        </OverviewBand>
      </div>

      <OverviewSectionTitle>Đơn hàng</OverviewSectionTitle>
      <div className={overviewListGroupClass}>
        <OverviewBand>
          <CompareCountRow
            label="Đơn tạo trong kỳ"
            pct={ordersCmp?.orderCountPct}
            current={orders?.orderCount}
            previous={ordersCmp?.orderCount}
          />
        </OverviewBand>
        <OverviewBand>
          <CompareCountRow
            label="Đơn đã đóng"
            pct={ordersCmp?.completedOrderCountPct}
            current={orders?.completedOrderCount}
            previous={ordersCmp?.completedOrderCount}
            valueClassName="text-(--color-success)"
          />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow label="Giá TB / đơn đóng">
            <span className="font-semibold tabular-nums text-(--color-info)">
              {orders != null ? formatMoney(orders.avgOrderValue) : "…"}
            </span>
          </OverviewStatRow>
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow label="Tại bàn / Mang về">
            <span className="font-semibold tabular-nums text-(--color-text-main)">
              {orders != null
                ? `${orders.dineInCount} · ${orders.takeawayCount}`
                : "…"}
            </span>
          </OverviewStatRow>
        </OverviewBand>
      </div>

      {orders?.byStatus?.length ? <StatusPipeline items={orders.byStatus} /> : null}

      <TopItemsList items={orders?.topItems ?? []} showRevenue maxItems={5} />

      {peakHours.length > 0 ? (
        <>
          <OverviewSectionTitle>Lịch tạo đơn</OverviewSectionTitle>
          <div className={overviewListGroupClass}>
            {peakHours.map((row) => (
              <OverviewBand key={row.hour}>
                <div className="flex justify-between items-center gap-3 text-sm">
                  <span className="font-medium text-(--color-text-emphasis)">
                    {hourBandLabel(row.hour)}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {row.count} đơn
                  </span>
                </div>
              </OverviewBand>
            ))}
          </div>
        </>
      ) : null}

      <OverviewSectionTitle>Nhân sự trong kỳ</OverviewSectionTitle>

      <div className={cn("", overviewListGroupClass)}>
        <OverviewBand>
          <OverviewStatRow label="Ca có mặt" value={staffPeriod?.workDays ?? "…"} />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Vắng (ngày có ca)"
            value={staffPeriod?.absentDays ?? "…"}
          />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Nghỉ CP · KP (ngày)"
            value={
              staffPeriod != null
                ? `${staffPeriod.paidLeaveDays} · ${staffPeriod.unpaidLeaveDays}`
                : "…"
            }
          />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Phút làm ghi nhận"
            value={
              staffPeriod != null
                ? staffPeriod.totalWorkMinutes.toLocaleString("vi-VN")
                : "…"
            }
          />
        </OverviewBand>
        {staffPeriod?.estimatedPayrollTotal != null ? (
          <OverviewBand>
            <OverviewStatRow label="Lương dự kiến (tháng hiện tại)">
              <span className="font-semibold tabular-nums text-(--color-primary)">
                {formatMoney(staffPeriod.estimatedPayrollTotal)}
                {staffPeriod.payrollLocked ? (
                  <span className="block text-xs font-normal text-(--color-text-secondary) mt-0.5">
                    Đã khóa kỳ
                  </span>
                ) : null}
              </span>
            </OverviewStatRow>
          </OverviewBand>
        ) : null}
      </div>
    </div>
  );
}
