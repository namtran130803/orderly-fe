# Orderly POS — Frontend

Ứng dụng web POS (mobile-first). React 19, TypeScript, Vite 8, Tailwind CSS v4.

API backend phải **đã chạy sẵn** trước khi mở app (cổng 3000). Cài đặt DB / API / Soketi: [orderly-be/README.md](../orderly-be/README.md).

## Yêu cầu

| Công cụ | Phiên bản gợi ý |
| -------- | ----------------- |
| [Node.js](https://nodejs.org/) | 20+ |
| npm | đi kèm Node |
| API backend | Đang lắng (vd. `http://localhost:3000` hoặc IP LAN) |

---

## Lần đầu chạy (dev)

### 1. Cài dependency

```bash
cd orderly-fe
npm install
```

### 2. Biến môi trường

```bash
cp .env.example .env
```

| Biến | Dev gợi ý |
| ------ | ----------- |
| `VITE_API_URL` | `/api` — Vite proxy sang backend |
| `VITE_PUSHER_KEY` | `orderly-key` (khớp BE) |
| `VITE_PUSHER_USE_VITE_PROXY` | `true` — WS qua HTTPS Vite, không gọi `ws://IP:6001` |

### 3. Proxy API (`vite.config.ts`)

Chỉnh `server.proxy['/api'].target` trùng URL backend:

```ts
proxy: {
  '/api': {
    target: 'http://192.168.1.9:3000',
    changeOrigin: true,
  },
},
```

- Cùng máy với API: `http://127.0.0.1:3000`
- Điện thoại trong LAN: IP máy dev (vd. `http://192.168.1.9:3000`)

### 4. Chạy dev server

```bash
npm run dev
```

- **HTTPS** + `host: 0.0.0.0` (bật sẵn) — cần cho camera QR chấm công
- Máy dev: `https://localhost:5173`
- LAN: `https://<IP-LAN>:5173` (xem dòng Network trong terminal)

Tài khoản mẫu (sau khi BE đã seed): SĐT `0901234567` … — mật khẩu `password123` (chi tiết trong README backend).

---

## Các lần chạy sau (dev)

```bash
cd orderly-fe
npm run dev
```

Chỉ cần `npm install` lại khi `package.json` thay đổi. Đảm bảo API backend vẫn đang chạy.

---

## Điện thoại trong LAN

1. Điện thoại và máy dev cùng Wi‑Fi.
2. `vite.config.ts` → `proxy['/api'].target` = `http://<IP-máy-dev>:3000`.
3. Giữ `VITE_PUSHER_USE_VITE_PROXY=true` (mặc định) — WS đi qua `wss://<IP>:5173/app`, Vite proxy sang Soketi.
4. Mở `https://<IP-máy-dev>:5173`, chấp nhận cảnh báo chứng chỉ dev.

Luồng mạng:

- REST: trình duyệt → Vite (`/api`) → backend
- WebSocket: trình duyệt → Vite (`/app`, WSS) → Soketi `:6001`

---

## Scripts npm

| Lệnh | Mô tả |
| ------ | ------ |
| `npm run dev` | Dev server (HTTPS, `--host`) |
| `npm run build` | Typecheck + build → `dist/` |
| `npm run preview` | Xem bản build local |
| `npm run lint` | ESLint |

---

## Biến môi trường

Chỉ biến `VITE_*` được đưa vào bundle.

| Biến | Mô tả |
| ------ | ------ |
| `VITE_API_URL` | Base path API (`/api` khi dùng proxy dev) |
| `VITE_PUSHER_KEY` | Khớp `PUSHER_APP_KEY` backend (`orderly-key`) |
| `VITE_PUSHER_USE_VITE_PROXY` | `true` (mặc định) — WSS qua Vite `/app` → Soketi; **bắt buộc khi dev HTTPS** |
| `VITE_PUSHER_HOST` | Chỉ khi `USE_VITE_PROXY=false` — nối thẳng Soketi |
| `VITE_PUSHER_PORT` | Cổng Soketi (`6001`) |
| `VITE_PUSHER_FORCE_TLS` | Chỉ khi nối thẳng Soketi |

`vite.config.ts` phải có proxy `/app` → `http://127.0.0.1:6001` (cùng máy chạy Docker Soketi).

Thiếu `VITE_PUSHER_KEY` → app vẫn chạy; đơn hàng không tự refresh realtime.

---

## Realtime đơn hàng

Trang **Đơn hàng** subscribe Soketi; khi có tạo / sửa / đổi trạng thái / xóa đơn, React Query tự invalidate.

| Thư mục | Vai trò |
| -------- | -------- |
| `src/realtime/` | Config, Pusher client, hằng số kênh/sự kiện |
| `src/hooks/useStoreOrdersRealtime.ts` | Hook gắn vào `OrdersPage`, `OrderFormPage` |

Cần `VITE_PUSHER_*` khớp backend và Soketi đang chạy.

---

## Cấu trúc `src/`

```
pages/       # Màn hình (orders, attendance, payroll, …)
components/  # UI dùng chung
services/    # Gọi API (axios)
stores/      # Zustand
hooks/       # usePerm, swipe tabs, realtime, …
realtime/    # WebSocket client
schemas/     # Zod form
config/      # paths, permissions
lib/         # api client, date-vn, …
```

---

## Xử lý sự cố

| Triệu chứng | Hướng xử lý |
| ------------- | ------------- |
| Network Error | API có chạy không; `proxy['/api'].target` đúng IP:port |
| 401 | Token hết hạn — đăng nhập lại; kiểm tra tài khoản seed BE |
| Camera QR không mở | Phải dùng **HTTPS** (`npm run dev`, không tắt `basicSsl`) |
| Đơn không realtime | `VITE_PUSHER_KEY` khớp BE; `USE_VITE_PROXY=true`; proxy `/app` trong `vite.config.ts`; Soketi `docker compose up` |
| Cảnh báo chứng chỉ | Self-signed dev — Proceed / Advanced trong trình duyệt |

---

## Production

```bash
npm run build
npm run preview
```

Deploy thư mục `dist/`:

- Build với `VITE_API_URL` trỏ API production
- HTTPS (bắt buộc cho QR)
- `VITE_PUSHER_*` trỏ Soketi production
- Reverse proxy `/api` → backend (thay cho proxy Vite dev)
