/** Nội dung hướng dẫn chấm công & lương — tách riêng để dễ chỉnh sửa. */
export type HrGuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const HR_GUIDE_SECTIONS: HrGuideSection[] = [
  {
    id: 'overview',
    title: 'Tổng quan',
    paragraphs: [
      'Orderly giúp bạn theo dõi ai đi làm, ai nghỉ và tính lương theo tháng. Quy trình gợi ý: cấu hình lịch → cài lương nhân viên → chấm công hàng ngày → duyệt đơn nghỉ → xem bảng lương → chốt kỳ.',
    ],
  },
  {
    id: 'schedule',
    title: 'Lịch làm việc',
    paragraphs: [
      'Cửa hàng có ngày làm mặc định (ví dụ T2–T7). Có thể thêm ngày đặc biệt: nghỉ bù (OFF) hoặc làm bù (WORKING_DAY) cho một ngày cụ thể.',
    ],
    bullets: [
      'Nhân viên có thể dùng lịch cửa hàng hoặc lịch riêng (chọn ngày T2–CN khi thêm/sửa lương).',
      'Chỉ những ngày được tính là “ngày làm” mới đưa vào công chuẩn và chấm công.',
    ],
  },
  {
    id: 'salary',
    title: 'Cài đặt lương nhân viên',
    paragraphs: [
      'Vào Quản lý → Nhân viên: khi thêm mới hoặc biểu tượng ví để chỉnh lương.',
    ],
    bullets: [
      'Lương tháng: mức lương đủ công trong một tháng (theo ngày công chuẩn).',
      'Lương giờ: tiền mỗi giờ × tổng giờ làm (từ check-in/check-out khi chấm WORK).',
      'Thay đổi lương chỉ áp dụng từ lần tính sau; không sửa bảng lương đã chốt.',
    ],
  },
  {
    id: 'attendance',
    title: 'Chấm công',
    paragraphs: [
      'Màn hình QR (kiosk): hiển thị mã cho nhân viên quét. Quét QR chấm công: mở camera, quét mã — lần đầu vào ca, lần sau ra ca trong ngày.',
    ],
    bullets: [
      'Chủ/quản lý có thể sửa tay từng ngày trên bảng chấm công (WORK, nghỉ có lương, nghỉ không lương).',
      'Ngày nghỉ theo lịch (OFF) không cần ghi nhận; ngày làm mà không chấm có thể hiện vắng (ABSENT).',
      'Kỳ lương đã khóa thì không chỉnh chấm công được.',
    ],
  },
  {
    id: 'leave',
    title: 'Đơn nghỉ',
    paragraphs: [
      'Nhân viên gửi đơn (có lương / không lương). Chủ duyệt hoặc từ chối trên chi tiết đơn.',
    ],
    bullets: [
      'Khi duyệt, hệ thống ghi nghỉ có lương hoặc không lương lên các ngày làm trong khoảng đơn.',
      'Không duyệt đơn nếu tháng trong khoảng nghỉ đã chốt lương.',
    ],
  },
  {
    id: 'payroll',
    title: 'Bảng lương & chốt kỳ',
    paragraphs: [
      'Chọn tháng để xem tạm tính. Lương tháng ≈ (ngày được trả / ngày công chuẩn) × lương cơ bản. Lương giờ ≈ (tổng phút WORK ÷ 60) × lương/giờ.',
    ],
    bullets: [
      'Ngày được trả: ngày làm có WORK hoặc nghỉ có lương (PAID_LEAVE).',
      'Chốt kỳ: lưu snapshot; sau đó không sửa chấm công/đơn nghỉ tháng đó.',
      'Mở khóa: xóa snapshot để chỉnh lại (chỉ khi cần).',
    ],
  },
  {
    id: 'roles',
    title: 'Ai làm được gì',
    paragraphs: [
      'Quyền gắn với vai trò cửa hàng (chấm công, lịch, đơn nghỉ, bảng lương…). Gán vai trò trong mục Nhân viên / Vai trò.',
    ],
  },
];
