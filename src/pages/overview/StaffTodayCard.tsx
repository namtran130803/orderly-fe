import { CalendarCheck2, CircleDollarSign } from "lucide-react";

import { cn } from "@/lib/cn";
import { paths } from "@/config/paths";
import type { DashboardStaffToday } from "@/types/dashboard";

import { OverviewBand, overviewListGroupClass } from "./OverviewBand";
import { OverviewNavLink } from "./OverviewNavLink";
import { OverviewSectionTitle } from "./OverviewSectionTitle";
import { OverviewStatRow } from "./OverviewStatRow";

type Props = { data: DashboardStaffToday };

export function StaffTodayCard({ data }: Props) {
  return (
    <>
      <OverviewSectionTitle>Nhân sự hôm nay</OverviewSectionTitle>

      <div className={cn("", overviewListGroupClass)}>
        <OverviewBand>
          <OverviewStatRow label="Có ca" value={data.scheduledCount} />
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow label="Đang ca">
            <span className="font-semibold tabular-nums text-(--color-success)">
              {data.workingCount}
            </span>
          </OverviewStatRow>
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow label="Vắng (có ca)">
            <span className="font-semibold tabular-nums text-(--color-warning)">
              {data.absentCount}
            </span>
          </OverviewStatRow>
        </OverviewBand>
        <OverviewBand>
          <OverviewStatRow
            label="Nghỉ CP / KP"
            value={`${data.paidLeaveToday} / ${data.unpaidLeaveToday}`}
          />
        </OverviewBand>

       

        {data.onShiftNow.length > 0 ? (
          <OverviewBand>
            <p className="text-xs font-medium text-(--color-text-secondary) mb-2">
              Đang mở ca
            </p>
            <ul className="flex flex-col gap-1">
              {data.onShiftNow.map((row) => (
                <li
                  key={row.employeeId}
                  className="text-sm font-medium text-(--color-primary)"
                >
                  {row.name}
                </li>
              ))}
            </ul>
          </OverviewBand>
        ) : null}
      </div>
    </>
  );
}
