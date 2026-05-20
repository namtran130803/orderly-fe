import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Palmtree, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { navigateBackOrTo } from "@/lib/browser-history";
import { leaveService } from "@/services/leave.service";
import { useStoreStore } from "@/stores/store.store";
import {
  createLeaveResolver,
  type CreateLeaveDto,
} from "@/schemas/leave.schema";

export const LeaveRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLeaveDto>({
    resolver: createLeaveResolver,
    defaultValues: { isPaid: false, reason: "" },
  });

  const isPaid = watch("isPaid");

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (body: CreateLeaveDto) =>
      leaveService.create(storeId!, {
        fromDate: body.fromDate,
        toDate: body.toDate,
        isPaid: body.isPaid,
        reason: body.reason || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      navigateBackOrTo(navigate, paths.leave.index);
    },
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header
        title="Viết đơn xin nghỉ"
        Icon={Palmtree}
        backUrl={paths.leave.index}
      >
        <button
          type="submit"
          form="leave-req"
          className="text-(--color-primary)"
          disabled={isPending}
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id="leave-req"
        onSubmit={handleSubmit((v) => mutate(v), onError)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6 mt-4">
          <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">
            Từ ngày
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <input
              type="date"
              required
              className="w-full text-sm"
              {...register("fromDate", { required: true })}
            />
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Đến ngày
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <input
              type="date"
              required
              className="w-full text-sm"
              {...register("toDate", { required: true })}
            />
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Loại nghỉ
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
            <label
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setValue("isPaid", false)}
            >
              <span className="text-sm text-(--color-text-main)">
                Không lương
              </span>
              <input
                type="radio"
                checked={isPaid === false}
                readOnly
                className="text-(--color-primary) size-4"
              />
            </label>
            <label
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setValue("isPaid", true)}
            >
              <span className="text-sm text-(--color-text-main)">Có lương</span>
              <input
                type="radio"
                checked={isPaid === true}
                readOnly
                className="text-(--color-primary) size-4"
              />
            </label>
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Lý do
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <textarea
              rows={4}
              className="w-full text-sm"
              {...register("reason")}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
