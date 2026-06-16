import { api } from "@/lib/api";
import type { StoreSubscription } from "@/services/store.service";

export type SubscriptionPlan = {
  id: number;
  code: string;
  name: string;
  days: number;
  price: number;
  isActive: boolean;
};

export type SubscriptionPeriod = {
  id: number;
  storeId: number;
  source: "TRIAL" | "PAYMENT" | "ADMIN_ADJUSTMENT" | "LEGACY_GRACE";
  days: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  payment?: (Pick<Payment, "id" | "paymentCode" | "amount" | "status" | "paidAt"> & {
    plan?: SubscriptionPlan;
  }) | null;
};

export type Payment = {
  id: number;
  amount: number;
  paymentCode: string;
  transferContent: string;
  provider: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";
  paidAt: string | null;
  createdAt: string;
  plan: SubscriptionPlan;
};

export type CheckoutResponse = {
  payment: Payment;
  bank: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const subscriptionService = {
  plans: () =>
    api.get<{ success: true; data: SubscriptionPlan[]; message: string }>(
      `/subscriptions/plans`,
    ),

  current: (storeId: number) =>
    api.get<{
      success: true;
      data: { subscription: StoreSubscription; periods: SubscriptionPeriod[] };
      message: string;
    }>(`/stores/${storeId}/subscription`),

  payments: (storeId: number) =>
    api.get<{ success: true; data: Payment[]; message: string }>(
      `/stores/${storeId}/subscription/payments`,
    ),

  periods: (
    storeId: number,
    params: { page?: number; limit?: number; source?: SubscriptionPeriod["source"] } = {},
  ) =>
    api.get<{
      success: true;
      data: SubscriptionPeriod[];
      pagination: PaginationMeta;
    }>(`/stores/${storeId}/subscription/periods`, { params }),

  checkout: (storeId: number, planDays: number) =>
    api.post<{ success: true; data: CheckoutResponse; message: string }>(
      `/stores/${storeId}/subscription/checkout`,
      { planDays },
    ),
};
