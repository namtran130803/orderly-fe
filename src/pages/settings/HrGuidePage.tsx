import React from "react";
import {
  Info,
  Calendar,
  DollarSign,
  QrCode,
  FileText,
  ClipboardCheck,
  Shield,
  ArrowRight,
  Check,
  X,
  Divide,
  AlertTriangle,
  Circle,
} from "lucide-react";

import { Header } from "@/components/Header";
import { paths } from "@/config/paths";

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, color, children }) => (
  <section className="border-b border-(--color-border-main)">
    <div className="bg-(--color-bg-surface)">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <span className={`shrink-0 ${color}`}>{icon}</span>
        <h3 className="font-semibold text-(--color-text-main)">{title}</h3>
      </div>
      <div className="px-4 pb-5 space-y-3">{children}</div>
    </div>
  </section>
);

const StepList: React.FC<{ steps: { label: string; desc: string }[] }> = ({
  steps,
}) => (
  <div className="space-y-2">
    {steps.map((s, i) => (
      <div key={i} className="flex items-start gap-3 text-sm">
        <span className="shrink-0 size-5 rounded-full bg-(--color-primary) text-white text-xs font-semibold flex items-center justify-center mt-0.5">
          {i + 1}
        </span>
        <div>
          <p className="font-semibold text-(--color-text-main)">{s.label}</p>
          <p className="text-(--color-text-secondary)">{s.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const Badge: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs font-semibold ${color} rounded`}
  >
    {label}
  </span>
);

const StatusRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  desc: string;
}> = ({ icon, label, desc }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="shrink-0 mt-0.5">{icon}</span>
    <div className="flex-1 min-w-0">
      <span className="font-semibold text-(--color-text-main)">{label}</span>
      <p className="text-(--color-text-secondary)">{desc}</p>
    </div>
  </div>
);

const Callout: React.FC<{
  variant: "danger" | "warning" | "success";
  children: React.ReactNode;
}> = ({ variant, children }) => {
  const colors = {
    danger: "border-l-(--color-danger) text-(--color-danger)",
    warning: "border-l-(--color-warning) text-(--color-warning)",
    success: "border-l-(--color-success) text-(--color-success)",
  };
  return (
    <div className={`border-l-2 ${colors[variant]} pl-3 text-sm`}>
      {children}
    </div>
  );
};

export const HrGuidePage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <Header
        title="Hướng dẫn chấm công & lương"
        Icon={Info}
        backUrl={paths.settings.index}
      />

      <div className="flex-1 overflow-auto py-4 flex flex-col gap-4">
        <div className="px-4 pt-4 pb-3 text-sm text-(--color-text-secondary) leading-relaxed bg-(--color-bg-surface) border-b border-(--color-border-main)">
          Tài liệu ngắn gọn giúp chủ cửa hàng vận hành chấm công và tính lương
          trên Orderly.
        </div>

        <SectionCard
          icon={<Calendar size={22} />}
          title="Quy trình cơ bản"
          color="text-(--color-primary)"
        >
          <StepList
            steps={[
              {
                label: "Lịch làm",
                desc: "đặt ngày làm mặc định trong tuần",
              },
              { label: "Cài lương", desc: "gán mức lương cho từng nhân viên" },
              {
                label: "Chấm công",
                desc: "nhân viên quét QR hoặc quản lý sửa tay",
              },
              {
                label: "Xử lý đơn nghỉ",
                desc: "duyệt hoặc từ chối đơn xin nghỉ",
              },
              { label: "Chốt kỳ", desc: "kiểm tra bảng lương rồi khoá" },
            ]}
          />
        </SectionCard>

        <SectionCard
          icon={<DollarSign size={22} />}
          title="Cài đặt lương"
          color="text-(--color-success)"
        >
          <p className="text-sm text-(--color-text-main)">
            Vào <span className="font-semibold">Quản lý → Nhân viên</span>, chọn{" "}
            <Badge
              label="Thêm mới"
              color="text-(--color-success) bg-(--color-success)/10"
            />{" "}
            hoặc{" "}
            <Badge
              label="Sửa"
              color="text-(--color-warning) bg-(--color-warning)/10"
            />{" "}
            để chỉnh lương.
          </p>
          <div className="flex gap-3 text-sm">
            <div className="flex-1 border border-(--color-border-main) p-3">
              <p className="font-semibold text-(--color-text-main) mb-1">
                Lương tháng
              </p>
              <p className="text-(--color-text-secondary)">
                Trả cố định, tính theo số ngày đi làm thực tế
              </p>
            </div>
            <div className="flex-1 border border-(--color-border-main) p-3">
              <p className="font-semibold text-(--color-text-main) mb-1">
                Lương giờ
              </p>
              <p className="text-(--color-text-secondary)">
                Trả theo số giờ làm, tính từ lúc vào ca đến ra ca
              </p>
            </div>
          </div>
          <Callout variant="danger">
            Thay đổi lương chỉ áp dụng cho kỳ sau.{" "}
            <span className="font-semibold">Không sửa được</span> bảng lương đã
            chốt.
          </Callout>
        </SectionCard>

        <SectionCard
          icon={<QrCode size={22} />}
          title="Chấm công"
          color="text-(--color-primary)"
        >
          <div className="text-sm text-(--color-text-main) space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-(--color-success)">
                Lần 1
              </span>
              <ArrowRight size={14} className="text-(--color-text-secondary)" />{" "}
              Quét mã{" "}
              <ArrowRight size={14} className="text-(--color-text-secondary)" />{" "}
              vào ca
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-(--color-danger)">Lần 2</span>
              <ArrowRight
                size={14}
                className="text-(--color-text-secondary)"
              />{" "}
              Quét mã{" "}
              <ArrowRight size={14} className="text-(--color-text-secondary)" />{" "}
              ra ca
            </div>
          </div>
          <p className="text-sm text-(--color-text-secondary)">
            Quản lý có thể{" "}
            <Badge
              label="sửa tay"
              color="text-(--color-warning) bg-(--color-warning)/10"
            />{" "}
            từng ngày.
          </p>
          <p className="text-sm font-semibold text-(--color-text-main)">
            Các trạng thái trong ngày:
          </p>
          <div className="space-y-2">
            <StatusRow
              icon={<Check size={16} className="text-(--color-success)" />}
              label="Đi làm"
              desc="nhân viên có mặt"
            />
            <StatusRow
              icon={<DollarSign size={16} className="text-(--color-primary)" />}
              label="Nghỉ có lương"
              desc="nghỉ phép, vẫn tính lương"
            />
            <StatusRow
              icon={<X size={16} className="text-(--color-danger)" />}
              label="Nghỉ không lương"
              desc="nghỉ, không tính lương"
            />
            <StatusRow
              icon={
                <AlertTriangle size={16} className="text-(--color-warning)" />
              }
              label="Vắng"
              desc="ngày làm nhưng không đi"
            />
            <StatusRow
              icon={
                <Circle size={16} className="text-(--color-text-secondary)" />
              }
              label="Cửa hàng nghỉ"
              desc="cửa hàng đóng cửa, không cần nhập"
            />
          </div>
          <Callout variant="danger">
            Khi kỳ lương đã <span className="font-semibold">khoá</span>, không
            thể chỉnh chấm công tháng đó.
          </Callout>
        </SectionCard>

        <SectionCard
          icon={<FileText size={22} />}
          title="Đơn nghỉ"
          color="text-(--color-warning)"
        >
          <p className="text-sm text-(--color-text-main)">
            Nhân viên gửi đơn. Chủ vào chi tiết đơn, bấm{" "}
            <Badge
              label="Duyệt"
              color="text-(--color-success) bg-(--color-success)/10"
            />{" "}
            hoặc{" "}
            <Badge
              label="Từ chối"
              color="text-(--color-danger) bg-(--color-danger)/10"
            />
            .
          </p>
          <div className="space-y-1 text-sm text-(--color-text-secondary)">
            <p>
              Khi duyệt, hệ thống tự động ghi trạng thái nghỉ lên các ngày trong
              đơn.
            </p>
          </div>
          <Callout variant="danger">
            Không duyệt được đơn nếu tháng đó đã khoá lương.
          </Callout>
        </SectionCard>

        <SectionCard
          icon={<ClipboardCheck size={22} />}
          title="Bảng lương & chốt kỳ"
          color="text-(--color-danger)"
        >
          <p className="text-sm text-(--color-text-secondary)">
            Chọn tháng → xem bảng lương <span className="italic">tạm tính</span>
            .
          </p>
          <div className="flex gap-3 text-sm">
            <div className="flex-1 border border-(--color-border-main) p-3 space-y-1">
              <p className="font-semibold text-(--color-text-main)">
                Lương tháng
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-(--color-success)">
                  (ngày đi làm + nghỉ có lương)
                </span>
                <Divide size={16} className="text-(--color-text-main)" />
                <span className="text-(--color-primary)">ngày công chuẩn</span>
                <X size={16} className="text-(--color-text-main)" />
                <span className="text-(--color-danger)">lương cơ bản</span>
              </div>
            </div>
            <div className="flex-1 border border-(--color-border-main) p-3 space-y-1">
              <p className="font-semibold text-(--color-text-main)">
                Lương giờ
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-(--color-primary)">tổng giờ làm</span>
                <X size={16} className="text-(--color-text-main)" />
                <span className="text-(--color-danger)">đơn giá giờ</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-(--color-text-main)">
            Bấm{" "}
            <Badge
              label="Khoá kỳ lương"
              color="text-(--color-danger) bg-(--color-danger)/10"
            />{" "}
            để chốt. Sau khi khoá:
          </p>
          <ul className="text-sm text-(--color-text-secondary) space-y-1 list-disc pl-5">
            <li>Không sửa được chấm công tháng đó</li>
            <li>Không duyệt được đơn nghỉ</li>
            <li>Bảng lương giữ nguyên (bản ghi chốt)</li>
          </ul>
          <p className="text-sm">
            <Badge
              label="Mở khoá"
              color="text-(--color-warning) bg-(--color-warning)/10"
            />
            <span className="text-(--color-text-secondary)">
              {" "}
              — xoá bản ghi chốt để chỉnh lại{" "}
            </span>
            <span className="text-(--color-warning) italic">
              (chỉ khi thực sự cần)
            </span>
          </p>
        </SectionCard>

        <SectionCard
          icon={<Shield size={22} />}
          title="Phân quyền"
          color="text-(--color-text-secondary)"
        >
          <p className="text-sm text-(--color-text-main)">
            Tạo vai trò (VD: Thu ngân, Phục vụ, Quản lý) và gán quyền tương ứng.
          </p>
          <p className="text-sm text-(--color-text-secondary)">
            Vào mục{" "}
            <span className="font-semibold text-(--color-primary)">
              Vai trò
            </span>{" "}
            để tạo/phân quyền,{" "}
            <span className="font-semibold text-(--color-primary)">
              Nhân viên
            </span>{" "}
            để gán vai trò.
          </p>
        </SectionCard>
      </div>
    </div>
  );
};
