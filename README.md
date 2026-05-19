# 🥤 Orderly POS — Frontend Web Application (React 19 & Vite)

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State-764ABC?style=for-the-badge&logo=react&logoColor=white)

Hệ thống Frontend giao diện ứng dụng Quản lý bán hàng (POS) chuỗi quán cà phê **Orderly**, tối ưu hóa hoàn toàn cho trải nghiệm di động và máy tính bảng (Native Mobile Feel) dựa trên hệ thống thiết kế **Flat UI**.

> **🎯 TRỌNG TÂM KIẾN TRUC (MODULE HÓA HOÀN TOÀN):**
> Mã nguồn được phân chia triệt để theo chiều dọc (**Vertical Slicing**), tách biệt rành mạch giữa UI Core, Layout chung, API Layer và Trạng thái (State). Toàn bộ form được kiểm soát tĩnh qua **React Hook Form** + **Zod**, trạng thái máy chủ được quản lý bằng **TanStack Query v5** và trạng thái cục bộ siêu tốc xử lý qua **Zustand**.

---

## 📋 Yêu Cầu Cài Đặt (Prerequisites)
- Cài đặt **Node.js** phiên bản 20.x trở lên (khuyến nghị dùng bản LTS mới nhất).
- Đảm bảo Backend API Server đang hoạt động (xem hướng dẫn khởi chạy tại kho mã nguồn `orderly-be`).

---

## 🚀 Hướng Dẫn Cài Đặt Ban Đầu (Setup Chung)

### Bước 1: Clone mã nguồn
```bash
git clone <repository-url>
cd orderly-fe
```

### Bước 2: Cài đặt các gói phụ thuộc
Sử dụng công cụ quản lý gói mặc định `npm` để nạp toàn bộ thư viện:
```bash
npm install
```

### Bước 3: Thiết lập Biến môi trường
Tạo file `.env` tại thư mục gốc của dự án để khai báo đường dẫn kết nối với Backend API:
```bash
# Ví dụ nội dung file .env kết nối với Backend ngầm định:
VITE_API_URL=http://localhost:3000
```

---

## 💻 Môi Trường Phát Triển (Development Mode)
Khi phát triển giao diện hoặc code tính năng mới, ứng dụng hỗ trợ tải lại cực nhanh (Hot Module Replacement - HMR) ngay khi file được lưu.

### Khởi chạy Server Phát triển
```bash
npm run dev
```
Hệ thống sẽ tự động lắng nghe và phục vụ giao diện tại địa chỉ:
- **Local host**: `http://localhost:5173/`
- **Mạng Lan (Network)**: Khả dụng truy cập trực tiếp từ điện thoại hoặc máy tính bảng dùng chung mạng Wi-Fi để trải nghiệm trọn vẹn cảm giác chạm vuốt thực tế.

> **💡 Trải nghiệm mượt mà**: Bạn có thể tự do mở VSCode, chỉnh sửa giao diện hay logic của bất kỳ feature nào. Ngay khi ấn Save (`Ctrl + S`), Vite HMR sẽ biên dịch và đẩy trạng thái cập nhật lên trình duyệt trong chưa đầy vài mili-giây mà không làm mất trạng thái của giỏ hàng hiện tại!

---

## 🌍 Môi Trường Thực Tế (Production Build)
Trước khi đóng gói lên các nền tảng host tĩnh (Vercel, Netlify, Nginx server...), hãy xác thực tính trọn vẹn của mã nguồn TypeScript và tạo bản phân phối sản phẩm.

### 1. Kiểm tra tĩnh và Đóng gói (Build)
Lệnh này sẽ tự động chạy rà soát toàn bộ quy tắc TypeScript (`tsc -b`) nhằm đảm bảo mã nguồn sạch 100% trước khi cho phép Vite tối ưu bundle:
```bash
npm run build
```
Kết quả bản dựng sản phẩm đã nén gọn sẽ nằm trong thư mục `dist/`.

### 2. Xem trước bản phân phối thực tế (Preview)
Mô phỏng chính xác môi trường vận hành thực tế bằng cách phục vụ thư mục `dist/` ở tốc độ cao nhất:
```bash
npm run preview
```

---

## 📁 Cấu Trúc Mã Nguồn (Directory System)

```text
src/
├── components/
│   ├── layout/        # Layout dùng chung (AppShell, AuthLayout, MainLayout, BottomNav...)
│   └── ui/            # UI kit nền tảng (Button, Spinner, EmptyState)
├── features/          # Cục bộ hóa API Hooks & nghiệp vụ theo mô-đun
│   ├── areas/         # Sơ đồ bàn và khu vực phục vụ
│   ├── auth/          # Đăng nhập, đăng ký và token interceptor
│   ├── dashboard/     # Biểu đồ và thống kê kinh doanh
│   ├── invoices/      # Quản lý dòng tiền thu chi
│   ├── menu/          # danh mục món
│   ├── orders/        # Nghiệp vụ order và thanh toán giỏ hàng
│   └── stores/        # Lựa chọn và quản lý chi nhánh
├── hooks/             # Custom hooks hỗ trợ (useConfirm, useSwipe, useDebounce)
├── lib/               # Cấu hình lõi (axios.ts, queryClient.ts, formatters.ts, validators.ts)
├── pages/             # Các trang View tương ứng với các phân vùng Route
├── store/             # Zustand stores (app, auth, cart, ui)
└── styles/            # Vanilla CSS Tokens định nghĩa biến màu sắc và layout
```

---
**Orderly POS Frontend** — Giao diện Tinh gọn, Phản hồi Siêu tốc, Tương thích Đa nền tảng.

Seed đã chạy **thành công** (exit code 0). Lỗi `dim is not defined` đã được xử lý; dữ liệu demo HRM đã được nạp đầy đủ.

### Đăng nhập để test
- **Admin / chủ cửa hàng 1 (Coffee)**: `0901234567` — `password123`
- **Chủ cửa hàng 2 (Bon Bon, dashboard chủ)**: `0903456789` — `password123`
- **Nhân viên Coffee**: `0902345678` … `0902345683` — `password123`
- **Nhân viên Bon Bon**: `0903456790`, `0903456791` — `password123`

### CH1 — Orderly Coffee (dùng test đầy đủ kịch bản)
- **Lịch**: T2–T7, **một chủ nhật** có ca bù (nếu logic có), **một thứ 4 đầu tháng** → `OFF`.
- **Chấm công**: nhiều ngày/dạng (giờ, trạng thái khác nhau).
- **Đơn nghỉ**: **PENDING**, **REJECTED**, **APPROVED** (duyệt trùng với **nghỉ có lương** cho NV giờ).
- **Lương**: **tháng trước đã khóa** — trên UI chọn tháng đó và test **“Mở khóa”**.

### CH2 — Bon Bon
- Dữ liệu **tối thiểu** (lịch, chấm công, ít đơn nghỉ) để so sánh với store “giàu”.

Nếu bạn muốn thêm case cụ thể (ví dụ chỉnh `AttendanceEditLog`, thêm snapshot tháng hiện tại, v.v.), nói rõ scenario để bổ sung trong `seed.ts`.

cả phần backend cũng như vậy, tái sử dụng những gì đã có không hard code, luôn đặt biến hằng số enum,... tách hàm, code dễ đọc dễ bảo trì, có chú tích rõ rang những ngắn gọn
tận dụng được những component đã có sẵn và hàm tiện tích đã có sẵn
phong cách phải đồng bộ với phong cách hiện tại của trang, phẳng tràn viền, không bo góc, không đổ bóng
ui ux phải phù hợp với giao diện phong cách của fe hiện tại là thiết kế chỉ cho điện thoại, không dùng trên máy tính, với phong cách phẳng và tràn viền để tối ưu không gian hiển thị, không nên có quá nhiều nút và form trong 1 màn hình, hãy tách nhỏ ra ra nhiều trang như hiện tại app đang code, mỗi trang 1  forrm 1 chức năng, để người dùng tập trung không bị loạn, làm xong bước 1 để trang 2 bước 2 làm tiếp, không dùng dailog hiển thị form để nhập, thêm chỉnh sửa luôn tạo 1 trang mới