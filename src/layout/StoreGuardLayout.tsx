import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStoreStore } from "@/stores/store.store";
import { paths } from "@/config/paths";
import { storeService } from "@/services/store.service";
import { PERMS } from "@/config/perms";

const ALL_PERMS: string[] = [
  ...Object.values(PERMS.attendance),
  ...Object.values(PERMS.schedule),
  ...Object.values(PERMS.leave),
  ...Object.values(PERMS.payroll),
];

export const StoreGuardLayout: React.FC = () => {
  const store = useStoreStore((s) => s.store);
  const setModules = useStoreStore((s) => s.setModules);
  const setPermissions = useStoreStore((s) => s.setPermissions);
  const queryClient = useQueryClient();

  const isOwner = store && (!store.roleName || store.roleName.length === 0);

  // Khi store thay đổi, invalidate queries cũ để force refetch
  useEffect(() => {
    if (store) {
      queryClient.invalidateQueries({ queryKey: ["store-modules"] });
      queryClient.invalidateQueries({ queryKey: ["store-roles-me"] });
    }
  }, [store?.id, queryClient]);

  const { data: modulesData } = useQuery({
    queryKey: ["store-modules", store?.id],
    queryFn: async () => {
      const res = await storeService.getModules(store!.id);
      return res.data.data;
    },
    enabled: !!store,
  });

  const { data: roleData } = useQuery({
    queryKey: ["store-roles-me", store?.id],
    queryFn: async () => {
      const res = await storeService.getRolesMe(store!.id);
      return res.data.data;
    },
    enabled: !!store && !isOwner,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!store) return;
    if (isOwner) {
      setPermissions(ALL_PERMS);
      return;
    }
    setPermissions([]);
  }, [store?.id, isOwner, setPermissions]);

  useEffect(() => {
    if (modulesData) {
      setModules(modulesData);
    }
  }, [modulesData, setModules]);

  useEffect(() => {
    if (!roleData || isOwner) return;
    const flatRoles = (roleData as { permissions: string[] }[]).flat();
    const unique: string[] = [];
    flatRoles.forEach((role) => {
      role.permissions.forEach((code) => {
        if (!unique.includes(code)) unique.push(code);
      });
    });
    setPermissions(unique);
  }, [roleData, isOwner, setPermissions]);

  if (!store) return <Navigate to={paths.stores.index} replace />;

  return <Outlet />;
};
