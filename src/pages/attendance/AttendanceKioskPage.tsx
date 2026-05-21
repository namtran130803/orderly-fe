import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QRCode } from "react-qr-code";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { attendanceService } from "@/services/attendance.service";
import { useStoreStore } from "@/stores/store.store";

export const AttendanceKioskPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const navigate = useNavigate();
  const [secLeft, setSecLeft] = useState(60);

  const { data, isLoading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["qr-token", storeId],
    queryFn: async () => {
      const res = await attendanceService.qrToken(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
    refetchInterval: 55_000,
  });

  // Khi countdown về 0, gọi lại API lấy QR mới
  useEffect(() => {
    if (secLeft === 0) {
      void refetch();
    }
  }, [secLeft, refetch]);

  useEffect(() => {
    if (!data?.expiresInSec) return;
    setSecLeft(data.expiresInSec);
  }, [dataUpdatedAt, data?.expiresInSec]);

  useEffect(() => {
    if (secLeft <= 0) return;
    const t = setInterval(() => setSecLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secLeft, dataUpdatedAt]);

  if (!storeId) {
    navigate(paths.stores.index, { replace: true });
    return null;
  }

  const token = data?.token ?? "";

  return (
    <div className="flex-1 flex flex-col relative h-full min-h-0 bg-(--color-bg-main)">
      {isLoading && <LoadingOverlay />}
      <Header
        title="QR chấm công"
        Icon={QrCode}
        backUrl={paths.settings.index}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 gap-6">
        <p className="text-xs text-center text-(--color-text-secondary) max-w-[280px]">
          Nhân viên mở app, quét mã để vào / ra ca. Mã làm mới mỗi phút.
        </p>
        <div className="bg-(--color-bg-surface) p-4 border border-(--color-border-main)">
          {token ? (
            <QRCode value={token} size={220} level="M" />
          ) : (
            <div className="size-[220px] flex items-center justify-center text-(--color-text-muted) text-sm">
              Đang tải…
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-xs text-(--color-text-secondary)">
            Hết hạn sau
          </div>
          <div className="text-2xl font-semibold text-(--color-primary) tabular-nums">
            {secLeft}s
          </div>
        </div>
      </div>
    </div>
  );
};
