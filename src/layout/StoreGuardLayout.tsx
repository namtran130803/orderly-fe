import { Outlet, Navigate } from 'react-router-dom';
import { useStoreStore } from '@/stores/store.store';
import { paths } from '@/config/paths';

export const StoreGuardLayout: React.FC = () => {
  const store = useStoreStore((s) => s.store);

  if (!store) return <Navigate to={paths.stores.index} replace />;

  return <Outlet />;
};
