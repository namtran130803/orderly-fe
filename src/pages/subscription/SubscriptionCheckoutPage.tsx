import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard } from "lucide-react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { paths } from "@/config/paths";
import type { CheckoutResponse } from "@/services/subscription.service";
import { useStoreStore } from "@/stores/store.store";
import { useAuthStore } from "@/stores/auth.store";
import { subscribeStoreSubscriptionPayments } from "@/realtime/pusher-client";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

function buildSepayQrUrl(checkout: CheckoutResponse) {
  const params = new URLSearchParams({
    bank: checkout.bank.bankName || "MBBank",
    acc: checkout.bank.accountNo || "0886138003",
    template: "qronly",
    amount: String(checkout.payment.amount),
    des: checkout.payment.transferContent,
    showinfo: "false",
    holder: checkout.bank.accountName || "TRAN TRONG NAM",
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

export const SubscriptionCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const store = useStoreStore((s) => s.store);
  const setStore = useStoreStore((s) => s.setStore);
  const token = useAuthStore((s) => s.token);
  const [paid, setPaid] = useState(false);
  const checkout = (location.state as { checkout?: CheckoutResponse } | null)
    ?.checkout;

  useEffect(() => {
    if (!store?.id || !checkout || !token) return;

    const sub = subscribeStoreSubscriptionPayments(store.id, (payload) => {
      if (payload.paymentCode !== checkout.payment.paymentCode) return;

      setPaid(true);
      setStore({
        ...store,
        subscription: payload.subscription,
      });
      queryClient.invalidateQueries({
        queryKey: ["subscription-status", store.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["subscription-periods", store.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
      toast.success("Thanh toán thành công");

      window.setTimeout(() => {
        navigate(-1);
      }, 1200);
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [store?.id, checkout?.payment.paymentCode, token, queryClient, navigate, setStore]);

  if (!checkout) {
    return <Navigate to={paths.settings.subscription} replace />;
  }

  const qrUrl = buildSepayQrUrl(checkout);
  const rows = [
    ["Ngân hàng", checkout.bank.bankName],
    ["Số tài khoản", checkout.bank.accountNo],
    ["Chủ tài khoản", checkout.bank.accountName],
    ["Số tiền", money(checkout.payment.amount)],
    ["Nội dung", checkout.payment.transferContent],
  ];

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Đã sao chép");
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <Header
        Icon={CreditCard}
        title="Thanh toán"
        subtitle={store?.name}
        backUrl={paths.settings.subscription}
      />

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0 overflow-auto pb-6">
          <section className="bg-(--color-bg-surface) border-y border-(--color-border-main) p-4 mt-4">
            <p className="text-sm text-(--color-text-secondary)">Gói đã chọn</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {checkout.payment.plan.name}
                </h2>
                <p className="text-xs text-(--color-text-secondary)">
                  Gia hạn thêm {checkout.payment.plan.days} ngày
                </p>
              </div>
              <span className="text-lg font-bold text-(--color-primary)">
                {money(checkout.payment.amount)}
              </span>
            </div>
            {paid && (
              <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-sm font-medium">
                <CheckCircle2 size={18} />
                Thanh toán thành công.
              </div>
            )}
          </section>

          <section className="bg-(--color-bg-surface) border-y border-(--color-border-main) p-4 mt-4">
            <div className="flex justify-center bg-white p-3 border border-(--color-border-main)">
              <img
                src={qrUrl}
                alt="QR Sepay"
                className="size-56 object-contain"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-(--color-text-secondary)">{label}</p>
                    <p className="font-medium break-all">{value || "---"}</p>
                  </div>
                  {value && (
                    <button
                      type="button"
                      onClick={() => copy(value)}
                      className="text-(--color-primary)"
                    >
                      <Copy size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
