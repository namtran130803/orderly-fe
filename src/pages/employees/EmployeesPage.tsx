import React from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Users,
  CirclePlus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { employeeService } from "@/services/employee.service";
import { useStoreStore } from "@/stores/store.store";
import { cn } from "@/lib/cn";

export const EmployeesPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", storeId],
    queryFn: async () => {
      const res = await employeeService.getAll(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header
        title="Quản lý nhân viên"
        Icon={Users}
        backUrl={paths.settings.index}
      >
        <Link to={paths.employees.create} className="text-(--color-primary)">
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && employees.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <Users size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có nhân viên nào</p>
              </div>
            )}
            {employees.length > 0 && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {employees.map((emp: any) => (
                  <div
                    key={emp.id}
                    className="px-4 py-3 flex justify-between items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-(--color-text-main) text-sm truncate">
                          {emp.user.name}
                        </span>
                        <span className="text-xs text-(--color-text-secondary) font-mono">
                          {emp.user.phone}
                        </span>
                      </div>
                      
                      {/* Roles Badges */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {emp.roles && emp.roles.length > 0 ? (
                          emp.roles.map((er: any) => (
                            <span
                              key={er.storeRole.id}
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all",
                                "bg-blue-50 text-blue-700 border-blue-200"
                              )}
                            >
                              {er.storeRole.name}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all bg-emerald-50 text-emerald-700 border-emerald-200">
                            Chủ cửa hàng
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-none">
                      <Link
                        to={paths.employees.edit(emp.id)}
                        state={{ employee: emp }}
                        className="text-(--color-warning)"
                      >
                        <Pencil size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
