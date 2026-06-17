import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  AreaChart,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bot,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Table2,
  Users,
  Utensils,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { subscriptionService } from "@/services/subscription.service";

const highlights = [
  {
    icon: ReceiptText,
    title: "Bán hàng không rối",
    text: "Tạo đơn tại bàn hoặc mang đi, chọn món, chỉnh số lượng, xóa/sửa đơn và chuyển trạng thái theo quy trình của quán.",
    tags: ["Đơn realtime", "Tiến/lùi trạng thái", "Bàn đang phục vụ"],
  },
  {
    icon: Utensils,
    title: "Menu luôn gọn",
    text: "Quản lý danh mục, món, giá, trạng thái còn bán; kéo sắp xếp nhóm món để nhân viên thao tác nhanh hơn.",
    tags: ["Danh mục", "Món bán", "Sắp xếp"],
  },
  {
    icon: Users,
    title: "Nhân sự rõ quyền",
    text: "Tạo nhân viên, phân vai trò theo cửa hàng, giới hạn quyền theo từng module và theo từng thao tác cụ thể.",
    tags: ["Vai trò", "Phân quyền", "Lương tháng/giờ"],
  },
  {
    icon: QrCode,
    title: "Chấm công QR",
    text: "Kiosk tạo mã QR, nhân viên quét vào/ra ca; quản lý xem bảng công tháng, sửa bản ghi khi cần và giữ lịch sử chỉnh sửa.",
    tags: ["QR động", "Vào/ra ca", "Bảng công"],
  },
  {
    icon: WalletCards,
    title: "Chi phí và lợi nhuận",
    text: "Ghi nhận phiếu chi theo ngày, đối chiếu doanh thu, chi phí và lợi nhuận trong cùng một màn hình thống kê.",
    tags: ["Phiếu chi", "Doanh thu", "Lợi nhuận"],
  },
  {
    icon: CalendarDays,
    title: "Lịch, nghỉ phép, lương",
    text: "Thiết lập ngày làm mặc định, thêm ngày nghỉ/làm bù, duyệt nghỉ phép có lương/không lương và chốt bảng lương.",
    tags: ["Ca làm", "Nghỉ phép", "Khóa lương"],
  },
];

const aiUses = [
  {
    icon: Bot,
    title: "AI nhập menu",
    text: "Chụp hoặc mô tả menu, AI phân tích rồi tạo danh mục và món. Có thể thêm vào menu hiện có hoặc thay mới toàn bộ.",
  },
  {
    icon: Sparkles,
    title: "AI nhập chi phí",
    text: "Đưa ảnh hóa đơn hoặc mô tả nhiều khoản chi, AI tách thành phiếu chi có tên, số tiền và ngày phát sinh.",
  },
];

const management = [
  ["Cửa hàng", "Tên, địa chỉ, nhiều cửa hàng, ngày làm mặc định"],
  ["Khu vực & bàn", "Tạo khu, sửa bàn, sắp xếp vị trí, theo dõi bàn bận"],
  ["Quy trình đơn", "Tự đặt trạng thái bắt đầu, giữa quy trình và hoàn tất"],
  ["Menu", "Danh mục, món, giá, còn bán/tạm hết, nhập bằng AI"],
  ["Đơn hàng", "Lọc theo ngày/trạng thái, chi tiết món, realtime"],
  ["Chi phí", "Tạo, sửa, xóa phiếu chi, nhập nhanh bằng AI"],
  ["Nhân sự", "Hồ sơ, lương tháng/giờ, ngày làm riêng, vai trò"],
  ["Chấm công", "Kiosk QR, quét ca, bản ghi tháng, chỉnh sửa"],
  ["Lịch làm", "Ngày làm mặc định, ngày nghỉ, ngày làm bù"],
  ["Nghỉ phép", "Gửi đơn, xem đơn của tôi, duyệt hoặc từ chối"],
  ["Lương", "Xem trước, chi tiết từng người, khóa/mở khóa bảng lương"],
  ["Thanh toán", "Gói dịch vụ, QR chuyển khoản, lịch sử gia hạn"],
  ["Quản trị hệ thống", "Người dùng, vai trò, cửa hàng, thanh toán, lịch sử gia hạn"],
];

const stats = [
  "Doanh thu, chi phí, lợi nhuận và so sánh kỳ trước",
  "Số đơn, đơn hoàn tất, giá trị trung bình mỗi đơn",
  "Tại bàn / mang đi, đơn theo trạng thái, đơn theo giờ",
  "Top món bán chạy theo số lượng và doanh thu",
  "Bàn bận, đơn mở, món tạm hết, đơn nghỉ phép chờ duyệt",
  "Nhân sự hôm nay: lịch làm, đang làm, vắng, nghỉ có/không lương",
  "Tổng ngày công, ngày vắng, phút làm và lương ước tính trong kỳ",
];

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex size-10 items-center justify-center bg-blue-50 text-[#007AFF] ring-1 ring-blue-100">
      <Icon size={20} strokeWidth={2.2} />
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <motion.div {...fadeUp} className="max-w-2xl">
      <p className="font-semibold text-[#007AFF]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">
        {title}
      </h2>
    </motion.div>
  );
}

export const LandingPage: React.FC = () => {
  const plansQuery = useQuery({
    queryKey: ["landing", "subscription-plans"],
    queryFn: async () => {
      const res = await subscriptionService.plans();
      return res.data.data;
    },
  });

  const plans = plansQuery.data ?? [];

  return (
    <div className="min-h-full bg-[#f7f7f7] text-[#0f172a]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 shadow-sm shadow-black/5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/ladi" className="flex items-center gap-3 font-semibold">
            <img src="/orderly-icon.svg" alt="Orderly" className="size-10" />
            <span className="text-lg">Orderly</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#3a3a3c] md:flex">
            <a href="#features">Chức năng</a>
            <a href="#ai">AI</a>
            <a href="#pricing">Gói dịch vụ</a>
            <a href="#stats">Thống kê</a>
          </nav>
          <a
            href="/register"
            className="hidden h-10 items-center gap-2 bg-[#007AFF] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0067d8] sm:inline-flex"
          >
            Đăng ký <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main className="overflow-x-hidden">
      <section className="relative min-h-[88svh] overflow-hidden bg-[#f7f7f7]">
        <img
          src="/ladi-hero.png"
          alt="Orderly trên điện thoại trong cửa hàng"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,247,247,0.98)_0%,rgba(247,247,247,0.9)_34%,rgba(247,247,247,0.3)_72%,rgba(247,247,247,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[#f7f7f7]/30 backdrop-blur-[2px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 pb-16 pt-12 sm:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full min-w-0"
            style={{ width: "min(42rem, calc(100vw - 40px))" }}
          >
            <div className="mb-5 inline-flex max-w-full items-center gap-2 bg-white/85 px-3 py-1.5 text-sm font-medium text-[#007AFF] ring-1 ring-blue-100 backdrop-blur">
              <BadgeCheck size={16} />
              <span className="sm:hidden">Dùng thử 7 ngày</span>
              <span className="hidden sm:inline">
                Dùng thử 7 ngày, tự động chuyển read-only khi hết hạn
              </span>
            </div>
            <h1
              className="text-[34px] font-bold leading-[1.1] text-[#0f172a] sm:text-5xl lg:text-6xl"
              style={{ width: "min(36rem, calc(100vw - 40px))" }}
            >
              Một app điện thoại gọn để quán chạy mượt cả ngày.
            </h1>
            <p
              className="mt-5 text-base leading-7 text-[#3a3a3c] sm:text-lg"
              style={{ width: "min(36rem, calc(100vw - 40px))" }}
            >
              Orderly gom POS, bàn, menu, nhân sự, chấm công, lương, nghỉ phép,
              chi phí và báo cáo vào một app nhẹ, dễ dùng cho quán cà phê, trà sữa,
              tiệm bánh và mô hình bán nhanh.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 bg-[#007AFF] px-6 font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#0067d8]"
              >
                Bắt đầu dùng thử <ArrowRight size={18} />
              </a>
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center bg-white/85 px-6 font-semibold text-[#0f172a] ring-1 ring-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                Đăng nhập
              </a>
            </div>
            <div className="mt-9 grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
              {[
                ["Realtime", "đơn & dashboard"],
                ["AI", "menu, chi phí"],
                ["QR", "chấm công"],
              ].map(([value, label]) => (
                <div
                  key={value}
                  className="min-w-0 bg-white/75 p-3 ring-1 ring-black/5 backdrop-blur"
                >
                  <p className="text-lg font-bold sm:text-xl">{value}</p>
                  <p className="mt-1 text-xs text-[#636366]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
        <SectionTitle
          eyebrow="Điểm nổi bật"
          title="Đủ sâu để quản lý, đủ gọn để nhân viên dùng ngay."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => (
            <motion.article
              key={item.title}
              {...fadeUp}
              className="bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10"
            >
              <IconTile icon={item.icon} />
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 leading-6 text-[#3a3a3c]">{item.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#3a3a3c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="ai" className="scroll-mt-24 bg-white py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow="AI trong Orderly"
              title="AI làm phần nhập liệu nặng tay, chủ quán vẫn kiểm soát dữ liệu."
            />
            <p className="mt-4 leading-7 text-[#3a3a3c]">
              AI được dùng đúng chỗ: đọc thông tin thô, biến thành menu hoặc phiếu
              chi có cấu trúc, rồi lưu vào dữ liệu cửa hàng sau khi người dùng xác nhận.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {aiUses.map((item) => (
              <motion.div key={item.title} {...fadeUp} className="bg-[#f7f7f7] p-5 ring-1 ring-black/5">
                <IconTile icon={item.icon} />
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 leading-6 text-[#3a3a3c]">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionTitle
          eyebrow="Quản lý những gì?"
          title="Không chỉ bán hàng. Đây là sổ vận hành của cả cửa hàng."
        />
        <div className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {management.map(([title, text]) => (
            <motion.div key={title} {...fadeUp} className="flex gap-3 bg-white p-4 ring-1 ring-black/5">
              <Check className="mt-0.5 shrink-0 text-[#007AFF]" size={18} />
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#3a3a3c]">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="stats" className="scroll-mt-24 bg-[#0f172a] py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-semibold text-blue-200">Thống kê</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Biết hôm nay đang ổn hay cần xử lý ngay.
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                [AreaChart, "Tài chính"],
                [LayoutDashboard, "Vận hành"],
                [Clock3, "Khung giờ"],
                [ClipboardCheck, "Nhân sự"],
              ].map(([Icon, label]) => {
                const MetricIcon = Icon as LucideIcon;
                return (
                  <div key={label as string} className="bg-white/10 p-4 ring-1 ring-white/10">
                    <MetricIcon size={20} className="text-blue-200" />
                    <p className="mt-3 font-semibold">{label as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <motion.div {...fadeUp} className="grid gap-2">
            {stats.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <RefreshCw className="mt-0.5 shrink-0 text-blue-200" size={16} />
                <p className="leading-6 text-white/85">{item}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
        <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-semibold text-[#007AFF]">Gói dịch vụ</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Dùng thử 7 ngày, sau đó gia hạn theo nhu cầu.
            </h2>
            <p className="mt-4 leading-7 text-[#3a3a3c]">
              Thanh toán bằng QR chuyển khoản qua Sepay. Khi giao dịch thành công,
              hệ thống cập nhật gói và gia hạn realtime.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white p-5 ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold">{plan.name}</h3>
                  <CreditCard size={18} className="text-[#007AFF]" />
                </div>
                <p className="mt-3 text-3xl font-bold">{money(plan.price)}</p>
                <p className="mt-2 text-sm leading-6 text-[#3a3a3c]">{plan.note}</p>
              </div>
            ))}
            {plansQuery.isLoading
              ? [30, 90, 180, 360].map((days) => (
                  <div key={days} className="h-36 animate-pulse bg-white p-5 ring-1 ring-black/5">
                    <div className="h-4 w-20 bg-slate-200" />
                    <div className="mt-5 h-8 w-28 bg-slate-200" />
                    <div className="mt-4 h-4 w-44 bg-slate-100" />
                  </div>
                ))
              : null}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
        <motion.div
          {...fadeUp}
          className="grid gap-5 bg-blue-50 p-6 ring-1 ring-blue-100 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Muốn cửa hàng chạy gọn hơn từ ca đầu tiên?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#3a3a3c]">
              Tạo tài khoản, thêm cửa hàng, nhập menu bằng AI hoặc thủ công, rồi
              bắt đầu nhận đơn và xem báo cáo ngay.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 bg-[#007AFF] px-6 font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#0067d8]"
            >
              Đăng ký dùng thử <ArrowRight size={18} />
            </a>
            <a
              href="/login"
              className="inline-flex h-12 items-center justify-center bg-white px-6 font-semibold text-[#0f172a] ring-1 ring-black/10 transition hover:-translate-y-0.5"
            >
              Vào ứng dụng
            </a>
          </div>
        </motion.div>
      </section>

      </main>

      <footer className="border-t border-black/10 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#3a3a3c] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/orderly-icon.svg" alt="Orderly" className="size-8" />
            <span className="font-semibold text-[#0f172a]">Orderly</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} /> Phân quyền chi tiết</span>
            <span className="inline-flex items-center gap-1.5"><LockKeyhole size={15} /> Hết hạn chuyển read-only</span>
            <span className="inline-flex items-center gap-1.5"><Banknote size={15} /> Gia hạn QR</span>
            <span className="inline-flex items-center gap-1.5"><Store size={15} /> Nhiều cửa hàng</span>
            <span className="inline-flex items-center gap-1.5"><Table2 size={15} /> Quản lý bàn</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
