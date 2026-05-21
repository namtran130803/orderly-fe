import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeStoreOrders } from '@/realtime/pusher-client';
import { isRealtimeEnabled } from '@/realtime/config';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Lắng nghe thay đổi đơn hàng (tạo / sửa / chuyển trạng thái / xóa) qua Soketi.
 * Tự invalidate cache danh sách đơn, chi tiết và bàn.
 */
export function useStoreOrdersRealtime(storeId: number | undefined): void {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!storeId || !token || !isRealtimeEnabled()) return;

    const sub = subscribeStoreOrders(storeId, () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId], exact: false });
      queryClient.invalidateQueries({
        queryKey: ['order-detail', storeId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ['tables', storeId], exact: false });
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [storeId, token, queryClient]);
}
