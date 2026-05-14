# FRONTEND GUIDE — Orderly React App
> Tài liệu này là **nguồn sự thật duy nhất** cho AI agent khi viết code frontend.
> Đọc toàn bộ trước khi sinh bất kỳ file nào. Không được bỏ qua bất kỳ mục nào.
> Khi tạo trang mới, bắt buộc đọc Mục 5 (Design System) và Mục 14 (Catalog) trước.

---

## Mục lục

1. [Phân tích App.tsx gốc](#1-phân-tích-apptsx-gốc)
2. [Công nghệ & phiên bản](#2-công-nghệ--phiên-bản)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Thiết lập dự án & Docker Containerization](#4-thiết-lập-dự-án--docker-containerization)
5. [Design System & Theme](#5-design-system--theme)
6. [Routing — React Router v7](#6-routing--react-router-v7)
7. [API Client — Axios + TanStack Query](#7-api-client--axios--tanstack-query)
8. [State toàn cục — Zustand](#8-state-toàn-cục--zustand)
9. [Forms — React Hook Form + Zod](#9-forms--react-hook-form--zod)
10. [Chuẩn viết Feature Module](#10-chuẩn-viết-feature-module)
11. [Danh sách Pages & Features](#11-danh-sách-pages--features)
12. [Shared Components cần tạo](#12-shared-components-cần-tạo)
13. [Checklist trước khi hoàn thành](#13-checklist-trước-khi-hoàn-thành)
14. [**UI Pattern Catalog — Đọc khi tạo trang mới**](#14-ui-pattern-catalog--đọc-khi-tạo-trang-mới)

---

## 1. Phân tích App.tsx gốc

### Các màn hình (Routes)

| Route | Mô tả | Guard |
|-------|-------|-------|
| `/auth` | Đăng nhập / Đăng ký | Chỉ hiện khi chưa login |
| `/stores/create` | Tạo cửa hàng đầu tiên | Cần login, chưa có store |
| `/` | App shell với bottom nav | Cần login + có store |
| `/dashboard` | Tổng quan doanh thu hôm nay | ✓ |
| `/orders` | Danh sách đơn hàng + tạo đơn | ✓ |
| `/imports` | Phiếu chi / nhập hàng | ✓ |
| `/settings` | Menu quản lý | ✓ |
| `/settings/stores` | Danh sách cửa hàng | ✓ |
| `/settings/menu` | Thực đơn (danh mục + món) | ✓ |
| `/settings/areas` | Khu vực & bàn | ✓ |
| `/settings/statuses` | Quy trình xử lý đơn | ✓ |

### Các luồng nghiệp vụ từ App.tsx

```
[Auth] → login/register → có store? → [App] : [Create Store]

[Orders]
  startNewOrder → [TableSelector] → chọn bàn/mang về → [QuickOrder] → chọn món → [OrderSummary] → saveOrder
  editOrder(existing) → [QuickOrder] với cart prefilled → [OrderSummary] → update

[OrderSummary]
  - isReadOnly: xem thông tin đơn
  - isUpdating: hiện split "Món mới / Món đang phục vụ"

[Settings] → sub-navigation dạng push screen (không phải modal)
```

### State quan trọng cần quản lý

| State | Scope | Tool |
|-------|-------|------|
| JWT token + user info | Global, persistent | Zustand + localStorage |
| Store đang chọn | Global, persistent | Zustand + localStorage |
| Danh sách stores | Server | TanStack Query |
| Menu, categories, areas... | Server | TanStack Query |
| Orders (realtime) | Server + polling | TanStack Query |
| Cart (đang tạo đơn) | Ephemeral UI | Zustand (slice riêng) |
| Quick order flow state | Ephemeral UI | Zustand (slice riêng) |
| Confirm dialog | UI only | Zustand hoặc Context |

---

## 2. Công nghệ & phiên bản

```json
{
  "runtime":        "Node.js 24 (LTS)",
  "build_tool":     "Vite 8.x (Rolldown engine)",
  "language":       "TypeScript 6.x (strict)",
  "framework":      "React 19.x",
  "react_compiler": "babel-plugin-react-compiler ^1.0.0",
  "routing":        "React Router v7",
  "server_state":   "TanStack Query v5",
  "client_state":   "Zustand v5",
  "forms":          "React Hook Form v7 + Zod v3",
  "http":           "Axios v1",
  "styling":        "Tailwind CSS v4",
  "icons":          "Lucide React",
  "animation":      "Motion (Framer Motion v12)",
  "date":           "dayjs",
  "number":         "Native Intl.NumberFormat"
}
```

### `package.json` tham chiếu

```json
{
  "name": "orderly-fe",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.x",
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-query-devtools": "^5.x",
    "@tailwindcss/vite": "^4.3.0",
    "axios": "^1.x",
    "dayjs": "^1.x",
    "lucide-react": "^1.14.0",
    "motion": "^12.x",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-hook-form": "^7.x",
    "react-router-dom": "^7.x",
    "tailwindcss": "^4.3.0",
    "zod": "^3.x",
    "zustand": "^5.x"
  },
  "devDependencies": {
    "@babel/core": "^7.29.0",
    "@eslint/js": "^10.0.1",
    "@rolldown/plugin-babel": "^0.2.3",
    "@types/babel__core": "^7.20.5",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "babel-plugin-react-compiler": "^1.0.0",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2",
    "vite": "^8.0.10"
  }
}
```

---

## 3. Cấu trúc thư mục

```
orderly-fe/
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── .env.example
├── .env.local
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── assets/
    ├── styles/
    │   ├── globals.css
    │   └── animations.css
    ├── lib/
    │   ├── axios.ts
    │   ├── queryClient.ts
    │   ├── formatters.ts
    │   └── validators.ts
    ├── types/
    │   ├── api.ts
    │   ├── models.ts
    │   └── common.ts
    ├── store/
    │   ├── auth.store.ts
    │   ├── app.store.ts
    │   ├── cart.store.ts
    │   └── ui.store.ts
    ├── hooks/
    │   ├── useConfirm.ts
    │   ├── useSwipe.ts
    │   ├── useSelectedStore.ts
    │   └── useDebounce.ts
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── index.ts
    │   └── layout/
    │       ├── AppShell.tsx
    │       ├── BottomNav.tsx
    │       ├── ScreenHeader.tsx
    │       ├── ConfirmDialog.tsx
    │       ├── ListSection.tsx
    │       └── ListItem.tsx
    ├── features/
    │   ├── auth/
    │   ├── stores/
    │   ├── dashboard/
    │   ├── orders/
    │   ├── menu/
    │   ├── areas/
    │   ├── statuses/
    │   └── invoices/
    └── pages/
        ├── AuthPage.tsx
        ├── CreateStorePage.tsx
        ├── DashboardPage.tsx
        ├── OrdersPage.tsx
        ├── ImportsPage.tsx
        ├── SettingsPage.tsx
        ├── SettingsStorePage.tsx
        ├── SettingsMenuPage.tsx
        ├── SettingsAreasPage.tsx
        ├── SettingsStatusesPage.tsx
        └── NotFoundPage.tsx
```

### Import Aliases (`@/`)

```typescript
// ✅ Đúng
import { Button }      from '@/components/ui';
import { useOrders }   from '@/features/orders';
import { formatMoney } from '@/lib/formatters';

// ❌ Sai
import { Button } from '../../../components/ui/Button';
```

#### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import { resolve }      from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

#### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target":            "ES2022",
    "lib":               ["ES2023", "DOM", "DOM.Iterable"],
    "module":            "ESNext",
    "moduleResolution":  "Bundler",
    "strict":            true,
    "jsx":               "react-jsx",
    "noEmit":            true,
    "skipLibCheck":      true,
    "baseUrl":           "./",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

---

## 4. Thiết lập dự án & Docker Containerization

### `Dockerfile`

```dockerfile
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
ARG VITE_API_URL
ARG VITE_APP_NAME=Orderly
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist  /usr/share/nginx/html
COPY nginx.conf                /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `nginx.conf`

```nginx
server {
    listen 80;
    root   /usr/share/nginx/html;
    index  index.html;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    location ~* \.(js|css|woff2?|png|svg|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location / { try_files $uri $uri/ /index.html; }
}
```

### `docker-compose.yml`

```yaml
services:
  fe-dev:
    build:
      context: ./orderly-fe
      target:  dev
    profiles: ["dev"]
    ports: ["5173:5173"]
    environment:
      - VITE_API_URL=http://localhost:3000/api
    volumes:
      - ./orderly-fe/src:/app/src:delegated
      - ./orderly-fe/public:/app/public:delegated
      - /app/node_modules

  fe-prod:
    build:
      context: ./orderly-fe
      target:  production
      args:
        VITE_API_URL: ${VITE_API_URL:-https://api.yourapp.com/api}
    ports: ["80:80"]
    restart: unless-stopped
```

---

## 5. Design System & Theme

### Triết lý thiết kế — ĐỌC KỸ TRƯỚC KHI CODE

App Orderly theo phong cách **Flat UI Native Mobile** — mô phỏng iOS Settings/Lists thuần túy. Đây là các nguyên tắc cốt lõi **không được vi phạm**:

#### Nguyên tắc 1: Flat — Không bo tròn, không shadow trên list sections

```
✅ ĐÚNG — Danh sách tràn viền trái phải, border-y:
<div class="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  <div class="px-4 py-3">...</div>
</div>

❌ SAI — Bo tròn, có padding ngang, card style:
<div class="mx-4 rounded-xl shadow-md bg-white">
  <div class="px-4 py-3">...</div>
</div>
```

#### Nguyên tắc 2: Full-bleed — List sections luôn chạm 2 mép trái phải

Mọi `bg-(--color-bg-surface)` section PHẢI có `border-y border-(--color-border-main)`. Không dùng `mx-4` hay padding ngang cho container section.

#### Nguyên tắc 3: Section label xuất hiện TRÊN mỗi nhóm

```tsx
{/* Label ở trên */}
<div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Tên nhóm</div>
{/* Section body tràn viền */}
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  ...
</div>
```

#### Nguyên tắc 4: Khoảng cách giữa các section là `mt-4`

```tsx
<div className="bg-(--color-bg-surface) border-y ...">/* section 1 */</div>

{/* mt-4 trước label của section tiếp theo */}
<div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Section 2</div>
<div className="bg-(--color-bg-surface) border-y ...">/* section 2 */</div>
```

#### Nguyên tắc 5: Background trang là `--color-bg-main` (#F2F2F7 — xám nhạt)

Nền trang luôn là màu xám nhạt. Các surface (card, list) là màu trắng `--color-bg-surface`.

#### Nguyên tắc 6: Active state dùng opacity hoặc bg subtle — KHÔNG dùng scale

```
✅ active:opacity-50           (cho icon buttons)
✅ active:bg-(--color-bg-subtle) (cho list items)
❌ active:scale-95             (chỉ dùng cho BottomNav items)
```

#### Nguyên tắc 7: Số tiền luôn dùng class `font-money`

```tsx
<span className="font-money">{formatMoney(price)}</span>
```

### CSS Variables — Bảng màu đầy đủ

```css
:root {
  /* Primary */
  --color-primary:        #007AFF;   /* Xanh iOS chính */
  --color-primary-light:  #E5F0FF;   /* Nền badge primary */
  --color-primary-dark:   #0063CC;   /* Text trên nền primary-light */

  /* Success */
  --color-success:        #34C759;   /* Xanh lá — doanh thu, hoàn thành */
  --color-success-dark:   #248A3D;
  --color-success-light:  #EBFBEE;

  /* Danger */
  --color-danger:         #FF3B30;   /* Đỏ — xóa, lỗi, chi tiêu */
  --color-danger-light:   #FFEBEE;

  /* Warning */
  --color-warning:        #FF9500;   /* Cam — chỉnh sửa, cảnh báo */
  --color-warning-dark:   #CC7600;
  --color-warning-light:  #FFF4E5;

  /* Info */
  --color-info:           #5856D6;   /* Tím — quy trình, trạng thái */
  --color-info-light:     #F2F2FF;

  /* Backgrounds */
  --color-bg-main:        #F2F2F7;   /* Nền trang (xám nhạt) */
  --color-bg-surface:     #FFFFFF;   /* Nền card/list (trắng) */
  --color-bg-subtle:      #F2F2F7;   /* Hover/active state */
  --color-bg-active:      #F9FAFB;   /* Tóm tắt/footer nhẹ */

  /* Borders */
  --color-border-main:    #E5E5EA;   /* Viền chính */
  --color-border-subtle:  #F2F2F7;   /* Viền phụ (mờ hơn) */

  /* Text */
  --color-text-main:      #000000;   /* Tiêu đề, nội dung chính */
  --color-text-emphasis:  #3A3A3C;   /* Nội dung phụ quan trọng */
  --color-text-secondary: #8E8E93;   /* Label, placeholder visible */
  --color-text-tertiary:  #636366;   /* Text cấp 3 */
  --color-text-muted:     #C7C7CC;   /* Disabled, rất mờ */
  --color-text-placeholder: #D1D1D6; /* Placeholder input */
}
```

### Màu sắc theo ngữ cảnh — Khi nào dùng màu gì

| Màu | Dùng cho |
|-----|---------|
| `--color-primary` | Nút chính, tab active, icon action, link |
| `--color-success` | Doanh thu (+), trạng thái hoàn thành, icon checkmark |
| `--color-danger` | Nút xóa, chi tiêu (-), lỗi form |
| `--color-warning` | Nút sửa (Pencil icon), badge "Có khách", cảnh báo |
| `--color-info` | Quy trình, màu icon của Settings > Statuses |
| `--color-text-secondary` | Label section header, subtitle, placeholder text |
| `--color-text-muted` | Số đếm nhỏ, separator dot `•`, text disabled |

### `src/styles/globals.css`

```css
@import "tailwindcss";

@layer base {
  :root {
    --color-primary:          #007AFF;
    --color-primary-light:    #E5F0FF;
    --color-primary-dark:     #0063CC;
    --color-success:          #34C759;
    --color-success-dark:     #248A3D;
    --color-success-light:    #EBFBEE;
    --color-danger:           #FF3B30;
    --color-danger-light:     #FFEBEE;
    --color-warning:          #FF9500;
    --color-warning-dark:     #CC7600;
    --color-warning-light:    #FFF4E5;
    --color-info:             #5856D6;
    --color-info-light:       #F2F2FF;
    --color-bg-main:          #F2F2F7;
    --color-bg-surface:       #FFFFFF;
    --color-bg-subtle:        #F2F2F7;
    --color-bg-active:        #F9FAFB;
    --color-border-main:      #E5E5EA;
    --color-border-subtle:    #F2F2F7;
    --color-text-main:        #000000;
    --color-text-emphasis:    #3A3A3C;
    --color-text-secondary:   #8E8E93;
    --color-text-tertiary:    #636366;
    --color-text-muted:       #C7C7CC;
    --color-text-placeholder: #D1D1D6;
  }

  * { -webkit-tap-highlight-color: transparent; }

  body {
    background: var(--color-bg-main);
    color: var(--color-text-main);
    font-family: -apple-system, 'SF Pro Text', BlinkMacSystemFont,
                 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}

@layer utilities {
  .font-money {
    font-family: 'SF Mono', SFMono-Regular, ui-monospace,
                 'DejaVu Sans Mono', monospace;
    font-variant-numeric: tabular-nums;
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .pb-safe  { padding-bottom: env(safe-area-inset-bottom, 0); }
  .h-svh    { height: 100svh; }
}
```

---

## 6. Routing — React Router v7

### `src/App.tsx`

```typescript
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore }  from '@/store/app.store';
import { AppShell }     from '@/components/layout/AppShell';
import { lazy, Suspense } from 'react';
import { Spinner }      from '@/components/ui';

const AuthPage            = lazy(() => import('@/pages/AuthPage'));
const CreateStorePage     = lazy(() => import('@/pages/CreateStorePage'));
const DashboardPage       = lazy(() => import('@/pages/DashboardPage'));
const OrdersPage          = lazy(() => import('@/pages/OrdersPage'));
const ImportsPage         = lazy(() => import('@/pages/ImportsPage'));
const SettingsPage        = lazy(() => import('@/pages/SettingsPage'));
const SettingsStorePage   = lazy(() => import('@/pages/SettingsStorePage'));
const SettingsMenuPage    = lazy(() => import('@/pages/SettingsMenuPage'));
const SettingsAreasPage   = lazy(() => import('@/pages/SettingsAreasPage'));
const SettingsStatusPage  = lazy(() => import('@/pages/SettingsStatusesPage'));
const NotFoundPage        = lazy(() => import('@/pages/NotFoundPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RequireStore({ children }: { children: React.ReactNode }) {
  const store = useAppStore((s) => s.selectedStore);
  if (!store) return <Navigate to="/stores/create" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="h-svh flex items-center justify-center">
        <Spinner size={32} />
      </div>
    }>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  { path: '/auth', element: <GuestOnly><Wrap><AuthPage /></Wrap></GuestOnly> },
  { path: '/stores/create', element: <RequireAuth><Wrap><CreateStorePage /></Wrap></RequireAuth> },
  {
    element: (
      <RequireAuth>
        <RequireStore>
          <AppShell />
        </RequireStore>
      </RequireAuth>
    ),
    children: [
      { index: true,               element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',         element: <Wrap><DashboardPage /></Wrap> },
      { path: 'orders',            element: <Wrap><OrdersPage /></Wrap> },
      { path: 'imports',           element: <Wrap><ImportsPage /></Wrap> },
      { path: 'settings',          element: <Wrap><SettingsPage /></Wrap> },
      { path: 'settings/stores',   element: <Wrap><SettingsStorePage /></Wrap> },
      { path: 'settings/menu',     element: <Wrap><SettingsMenuPage /></Wrap> },
      { path: 'settings/areas',    element: <Wrap><SettingsAreasPage /></Wrap> },
      { path: 'settings/statuses', element: <Wrap><SettingsStatusPage /></Wrap> },
    ],
  },
  { path: '*', element: <Wrap><NotFoundPage /></Wrap> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

### `src/components/layout/AppShell.tsx`

```typescript
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="bg-(--color-bg-subtle) h-svh flex justify-center items-center">
      <div className="w-full max-w-[480px] h-svh bg-(--color-bg-surface) relative
                      overflow-hidden flex flex-col mx-auto border-x border-(--color-border-main)">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
```

---

## 7. API Client — Axios + TanStack Query

### `src/lib/axios.ts`

```typescript
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error: { code: string; message: string } }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  return 'Đã có lỗi xảy ra';
}
```

### `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 2,
      gcTime:               1000 * 60 * 10,
      retry:                1,
      refetchOnWindowFocus: true,
    },
  },
});
```

### `src/types/api.ts`

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string;
}

export interface Paginated<T> {
  success:    boolean;
  data:       T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number; limit: number; total: number; totalPages: number;
}

export interface PaginationQuery {
  page?: number; limit?: number;
}
```

---

## 8. State toàn cục — Zustand

### `src/store/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types/models';

interface AuthState {
  token:  string | null;
  user:   UserProfile | null;
  login:  (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, user: null,
      login:  (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'orderly-auth', partialize: (s) => ({ token: s.token, user: s.user }) },
  ),
);
```

### `src/store/app.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '@/types/models';

interface AppState {
  selectedStore:    Store | null;
  setSelectedStore: (store: Store) => void;
  clearStore:       () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedStore:    null,
      setSelectedStore: (store) => set({ selectedStore: store }),
      clearStore:       () => set({ selectedStore: null }),
    }),
    { name: 'orderly-app' },
  ),
);
```

### `src/store/cart.store.ts`

```typescript
import { create } from 'zustand';
import type { CartItem, Table } from '@/types/models';

type OrderFlowStep = 'idle' | 'table-select' | 'quick-order' | 'summary';

interface CartState {
  step:           OrderFlowStep;
  editingOrderId: string | null;
  isReadOnly:     boolean;
  selectedTable:  Table | null;
  cart:           CartItem[];
  startNew:    () => void;
  startEdit:   (orderId: string, table: Table | null, cart: CartItem[]) => void;
  startView:   (orderId: string, table: Table | null, cart: CartItem[]) => void;
  selectTable: (table: Table | null) => void;
  goToOrder:   () => void;
  goToSummary: () => void;
  goBack:      () => void;
  reset:       () => void;
  addItem:    (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (itemId: string) => void;
  setQty:     (itemId: string, qty: number) => void;
}

const INITIAL = { step: 'idle' as OrderFlowStep, editingOrderId: null, isReadOnly: false, selectedTable: null, cart: [] };

export const useCartStore = create<CartState>()((set, get) => ({
  ...INITIAL,
  startNew:    () => set({ ...INITIAL, step: 'table-select' }),
  startEdit:   (id, table, cart) => set({ step: 'quick-order', editingOrderId: id, isReadOnly: false, selectedTable: table, cart }),
  startView:   (id, table, cart) => set({ step: 'summary', editingOrderId: id, isReadOnly: true, selectedTable: table, cart }),
  selectTable: (table) => set({ selectedTable: table }),
  goToOrder:   () => set({ step: 'quick-order' }),
  goToSummary: () => set({ step: 'summary' }),
  goBack:      () => {
    const { step, editingOrderId } = get();
    if (step === 'summary' && !editingOrderId)          set({ step: 'quick-order' });
    else if (step === 'quick-order' && !editingOrderId) set({ step: 'table-select' });
    else set({ ...INITIAL });
  },
  reset:       () => set({ ...INITIAL }),
  addItem:     (item) => set((s) => {
    const ex = s.cart.find((i) => i.id === item.id);
    if (ex) return { cart: s.cart.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
    return { cart: [...s.cart, { ...item, qty: 1 }] };
  }),
  removeItem:  (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
  setQty:      (id, qty) => set((s) => ({
    cart: qty <= 0 ? s.cart.filter((i) => i.id !== id) : s.cart.map((i) => i.id === id ? { ...i, qty } : i),
  })),
}));
```

### `src/store/ui.store.ts`

```typescript
import { create } from 'zustand';

interface ConfirmOptions {
  title: string; message: string; confirmLabel?: string; danger?: boolean;
}

interface UIState {
  confirm: { isOpen: boolean; options: ConfirmOptions | null; resolve: ((ok: boolean) => void) | null };
  openConfirm:  (options: ConfirmOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  confirm: { isOpen: false, options: null, resolve: null },
  openConfirm: (options) => new Promise<boolean>((resolve) => {
    set({ confirm: { isOpen: true, options, resolve } });
  }),
  closeConfirm: (result) => {
    get().confirm.resolve?.(result);
    set({ confirm: { isOpen: false, options: null, resolve: null } });
  },
}));
```

---

## 9. Forms — React Hook Form + Zod

### Pattern chuẩn

```typescript
// schema.ts
import { z } from 'zod';
export const menuItemSchema = z.object({
  name:       z.string().trim().min(1, 'Tên không được để trống'),
  price:      z.coerce.number().int().positive('Giá phải là số dương'),
  categoryId: z.string().uuid('Chọn danh mục'),
});
export type MenuItemFormData = z.infer<typeof menuItemSchema>;

// Form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm<MenuItemFormData>({
  resolver:      zodResolver(menuItemSchema),
  defaultValues: { name: '', price: 0, categoryId: '' },
});
```

---

## 10. Chuẩn viết Feature Module

```
Page (route component — rất mỏng, chỉ compose)
  └── Feature Component
        └── Hook (useXxx, useXxxMutations)
              └── API function (xxxApi.list, xxxApi.create)
                    └── Axios instance → Backend
```

---

## 11. Danh sách Pages & Features

### AuthPage

- Form đăng nhập (phone + password) với validation Zod
- Toggle sang form đăng ký (name + phone + password)
- Sau login: navigate `/dashboard` hoặc `/stores/create`

### CreateStorePage

- Form 2 trường: `name`, `address`
- Sau tạo: set `selectedStore`, navigate `/dashboard`

### DashboardPage

- Header: tên store + địa chỉ (subtitle)
- Stats: Doanh thu, Nhập hàng, Đơn hàng
- Top 3 món bán chạy

### OrdersPage

- Tabs theo status (swipeable)
- List OrderCard + FAB `+`
- Overlay screens (không push route): `TableSelector`, `QuickOrder`, `OrderSummary`

### ImportsPage

- List InvoiceCard
- FAB `+` → form slide-up

### SettingsPage → navigate các sub-pages

### SettingsStatusesPage

- Drag-to-reorder cho `type === 'mid'` (`@dnd-kit/sortable`)
- Chặn sửa/xóa khi còn đơn active

---

## 12. Shared Components cần tạo

### `ScreenHeader` — Component quan trọng nhất

```typescript
// src/components/layout/ScreenHeader.tsx
interface ScreenHeaderProps {
  title:        string;
  subtitle?:    string;
  icon?:        React.ReactNode;
  onBack?:      () => void;    // Hiện ChevronLeft nếu có
  rightAction?: React.ReactNode;
}

// Layout chuẩn (copy từ App.tsx renderHeader):
// h-[60px] px-4 flex items-center justify-between
// sticky top-0 z-10 bg-(--color-bg-surface) border-b border-(--color-border-main)
```

### `ConfirmDialog`

- Subscribe `ui.store`
- Motion `AnimatePresence` fade + scale
- Nút Hủy (text-secondary) + Xóa (text-danger)

### `EmptyState`

```tsx
// Icon 48px opacity-50, message text-sm text-(--color-text-muted)
// Centered in parent
```

### `Button`

```typescript
interface ButtonProps {
  variant?:  'primary' | 'danger' | 'ghost';
  loading?:  boolean;
  fullWidth?: boolean;
}
// primary: bg-(--color-primary) text-white py-4 font-bold text-lg
// fullWidth: w-full
```

---

## 13. Checklist trước khi hoàn thành

### Cấu trúc & setup
- [ ] `vite.config.ts` có alias `@` và `babel-plugin-react-compiler`
- [ ] `tsconfig.app.json` có `strict: true` và paths alias
- [ ] `.env.local` không bị commit
- [ ] `VITE_API_URL` dùng trong `axios.ts`, không hardcode

### Docker
- [ ] 3 stages: `base → dev → builder → production`
- [ ] `nginx.conf` có SPA fallback
- [ ] Dev volume mount `src/` và `public/`
- [ ] `node_modules` dùng anonymous volume

### Routing
- [ ] 3 guards: `RequireAuth`, `RequireStore`, `GuestOnly`
- [ ] Pages lazy load qua `React.lazy()`

### UI/UX — Design Compliance
- [ ] Không có card bo tròn cho list sections
- [ ] Mọi surface section dùng `border-y border-(--color-border-main)`
- [ ] Section headers dùng đúng class `px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)`
- [ ] Khoảng cách section dùng `mt-4` — không dùng gap/space-y
- [ ] Số tiền dùng `font-money` + `formatMoney()`
- [ ] Active state dùng `active:opacity-50` hoặc `active:bg-(--color-bg-subtle)`
- [ ] Nền trang là `bg-(--color-bg-main)`, surface là `bg-(--color-bg-surface)`
- [ ] Bottom action button: `w-full py-4 bg-(--color-primary) text-white font-bold text-lg`
- [ ] Header sticky: `h-[60px] sticky top-0 z-10`
- [ ] `pb-safe` cho bottom nav và button cuối trang
- [ ] Không có `console.log` debug

### Mobile
- [ ] App container `max-w-[480px]` centered
- [ ] Tap area tối thiểu 44×44px
- [ ] `-webkit-tap-highlight-color: transparent` áp dụng global

---

## 14. UI Pattern Catalog — Đọc khi tạo trang mới

> Đây là bản catalog đầy đủ tất cả pattern UI đã dùng trong App.tsx. Khi tạo trang mới, tìm pattern phù hợp và copy nguyên xi class — không tự sáng tạo.

---

### Pattern 1: Khung trang chuẩn

Mọi trang đều bắt đầu bằng cấu trúc này:

```tsx
// Trang không scroll (full height layout)
<div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
  <ScreenHeader ... />
  <div className="flex-1 overflow-y-auto pb-safe">
    {/* Nội dung */}
  </div>
</div>

// Trang scroll đơn giản (không có tab hay sticky nội dung phụ)
<div className="flex-1 bg-(--color-bg-main) flex flex-col overflow-y-auto no-scrollbar">
  <ScreenHeader ... />
  <div className="pb-safe">
    {/* Nội dung */}
  </div>
</div>
```

---

### Pattern 2: ScreenHeader (Header màn hình)

Header cao **60px**, sticky, border dưới. Có 3 vùng: trái (back + icon + title), phải (action button).

```tsx
// Header với nút back + icon + title + right action
<div className="bg-(--color-bg-surface) h-[60px] px-4 flex items-center justify-between
                shrink-0 z-10 border-b border-(--color-border-main) sticky top-0">
  <div className="flex items-center gap-3 overflow-hidden">
    {/* Nút back (nếu có) */}
    <button onClick={onBack} className="p-2 -ml-2 active:opacity-50 transition-opacity
                                        text-(--color-primary) shrink-0">
      <ChevronLeft size={24} />
    </button>
    {/* Icon (nếu có) */}
    <div className="text-(--color-primary) shrink-0">
      <Utensils size={20} />
    </div>
    {/* Title + subtitle */}
    <div className="flex flex-col min-w-0">
      <h2 className="text-base font-bold text-(--color-text-main) truncate">Tiêu đề</h2>
      <p className="text-xs text-(--color-text-secondary) truncate">Phụ đề (tuỳ chọn)</p>
    </div>
  </div>
  {/* Right action (tuỳ chọn) */}
  <div className="shrink-0">
    <button className="text-(--color-primary) active:opacity-50">
      <Plus size={24} />
    </button>
  </div>
</div>

// Header đơn giản — không có back button
<div className="bg-(--color-bg-surface) h-[60px] px-4 flex items-center justify-between
                shrink-0 z-10 border-b border-(--color-border-main) sticky top-0">
  <div className="flex items-center gap-3">
    <div className="text-(--color-primary)"><BarChart3 size={24} /></div>
    <h2 className="text-base font-bold text-(--color-text-main)">Dashboard</h2>
  </div>
</div>
```

---

### Pattern 3: Section Label + Section Body

Đây là pattern cốt lõi của mọi danh sách trong app.

```tsx
{/* === SECTION ĐƠN LẺ === */}
<div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Tên nhóm</div>
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  {/* Items */}
</div>

{/* === NHIỀU SECTION NỐI TIẾP === */}
<div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Nhóm 1</div>
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  {/* ... */}
</div>

{/* mt-4 TRƯỚC label, KHÔNG phải trước section body */}
<div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Nhóm 2</div>
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  {/* ... */}
</div>

{/* === SECTION KHÔNG CÓ LABEL (dùng mt-4 trước section body) === */}
<div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
  {/* ... */}
</div>
```

---

### Pattern 4: List Item — Các kiểu row

```tsx
{/* Row cơ bản: label trái + value phải */}
<div className="px-4 py-3 flex items-center justify-between">
  <span className="text-base text-(--color-text-main)">Tên trường</span>
  <span className="text-base text-(--color-text-secondary)">Giá trị</span>
</div>

{/* Row có icon trái + text + chevron phải (navigation row) */}
<button className="w-full px-4 py-3 flex items-center justify-between
                   active:bg-(--color-bg-subtle) transition-colors">
  <div className="flex items-center gap-3">
    {/* Icon badge (kiểu Settings) */}
    <div className="w-8 h-8 rounded-lg bg-(--color-primary-light) text-(--color-primary-dark)
                    flex items-center justify-center">
      <StoreIcon size={18} />
    </div>
    <span className="text-sm text-(--color-text-main) font-medium">Cửa hàng</span>
  </div>
  <ChevronRight size={20} className="text-(--color-text-placeholder)" />
</button>

{/* Row có title + subtitle + action buttons phải */}
<div className="p-4 flex items-center justify-between">
  <div className="flex-1 min-w-0 pr-4">
    <h4 className="text-sm text-(--color-text-main) font-semibold truncate">Tiêu đề</h4>
    <p className="text-sm text-(--color-text-secondary) mt-0.5">Phụ đề</p>
  </div>
  <div className="flex items-center gap-4 shrink-0 border-l border-(--color-border-subtle) pl-4">
    <button className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
    <button className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
  </div>
</div>

{/* Row tiền tệ: icon + label + số tiền màu */}
<div className="p-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Plus size={20} className="text-(--color-success)" />
    <span className="text-sm text-(--color-text-main) font-semibold">Doanh thu</span>
  </div>
  <span className="text-sm font-semibold text-(--color-success) font-money">
    {formatMoney(revenue)}
  </span>
</div>

{/* Row checkbox/radio (có dấu tick) */}
<button className="w-full flex items-center justify-between px-4 py-4
                   active:bg-(--color-bg-subtle) transition-colors text-left">
  <span className="text-[15px] font-semibold text-(--color-primary)">Tên đã chọn</span>
  <div className="w-5 h-5 rounded-full bg-(--color-primary) text-(--color-bg-surface)
                  flex items-center justify-center mr-2">
    <Check size={12} />
  </div>
</button>
```

---

### Pattern 5: Tab Bar (Swipeable Tabs)

Dùng cho OrderStatusTabs, CategoryTabs, AreaTabs.

```tsx
{/* Tab bar — sticky, scroll ngang nếu nhiều tab */}
<div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main)
                overflow-x-auto no-scrollbar shrink-0 sticky top-0 z-10">
  {tabs.map((tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        id={`tab-${tab.id}`}           {/* Cần id để scrollIntoView */}
        onClick={() => setActiveTab(tab.id)}
        className={`py-3 px-4 text-sm whitespace-nowrap transition-colors border-b-2
          flex items-center gap-2
          ${isActive
            ? 'border-(--color-primary) text-(--color-primary) font-medium'
            : 'border-transparent text-(--color-text-secondary)'
          }`}
      >
        {tab.name}
        {/* Badge đếm (tuỳ chọn) */}
        <span className={`px-1.5 py-0.5 rounded text-[10px]
          ${isActive
            ? 'bg-(--color-primary-light) text-(--color-primary-dark)'
            : 'bg-(--color-bg-subtle) text-(--color-text-secondary)'
          }`}>
          {tab.count}
        </span>
      </button>
    );
  })}
</div>
```

---

### Pattern 6: Form Item (iOS style — label trái, input phải)

```tsx
{/* Container form */}
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200 mt-4">

  {/* Text input */}
  <div className="flex px-4 py-3">
    <span className="w-1/3 text-(--color-text-main)">Tên</span>
    <input
      name="name"
      placeholder="Nhập tên..."
      className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right"
    />
  </div>

  {/* Number input */}
  <div className="flex px-4 py-3">
    <span className="w-1/3 text-(--color-text-main)">Giá</span>
    <input
      type="number"
      name="price"
      placeholder="0"
      className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right font-money"
    />
  </div>

  {/* Select */}
  <div className="flex px-4 py-3 items-center gap-2">
    <span className="w-1/3 text-(--color-text-main)">Danh mục</span>
    <select
      name="categoryId"
      className="flex-1 outline-none bg-transparent appearance-none text-right text-(--color-text-main)"
    >
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  </div>

</div>
```

---

### Pattern 7: Bottom Action Button

Nút hành động chính luôn ở cuối trang, full width, có safe area.

```tsx
{/* Nút đơn lẻ cuối trang */}
<div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
  <button
    type="submit"
    className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4
               text-center font-bold text-lg active:opacity-80 transition-opacity"
  >
    Lưu
  </button>
</div>

{/* Footer có thêm tổng tiền phía trên nút */}
<div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
  <div className="px-4 py-4 flex justify-between items-center">
    <span className="text-base font-bold text-(--color-text-main)">Tổng cộng</span>
    <span className="text-2xl font-bold text-(--color-success) font-money">
      {formatMoney(total)}
    </span>
  </div>
  <button className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4
                     text-center font-bold text-lg active:opacity-80 transition-opacity">
    Xác nhận
  </button>
</div>

{/* Footer tóm tắt nhỏ + nút */}
<div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
  <div className="px-4 py-3 flex justify-between items-center bg-(--color-bg-active)">
    <span className="text-sm text-(--color-text-secondary)">3 món, 5 phần</span>
    <span className="text-lg font-bold text-(--color-text-main) font-money">
      {formatMoney(cartTotal)}
    </span>
  </div>
  <button className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4
                     text-center font-bold text-lg active:opacity-80 transition-opacity">
    TIẾP TỤC
  </button>
</div>
```

---

### Pattern 8: Overlay Screen (Push screen từ dưới hoặc từ phải)

Dùng khi cần màn hình phủ toàn bộ (TableSelector, QuickOrder, Form modal).

```tsx
{/* Overlay từ dưới lên — dùng cho flows mới (TableSelector) */}
{show && (
  <div className="absolute inset-0 bg-(--color-bg-main) z-90 flex flex-col
                  animate-in slide-in-from-bottom">
    <ScreenHeader title="Tiêu đề" onBack={() => setShow(false)} />
    <div className="flex-1 overflow-y-auto pb-safe">
      {/* Nội dung */}
    </div>
  </div>
)}

{/* Overlay từ phải sang — dùng cho sub-screen (QuickOrder, OrderSummary, Form) */}
{show && (
  <div className="absolute inset-0 bg-(--color-bg-main) z-90 flex flex-col
                  animate-in slide-in-from-right-4">
    <ScreenHeader title="Tiêu đề" onBack={() => setShow(false)} />
    <div className="flex-1 overflow-y-auto pb-safe">
      {/* Nội dung */}
    </div>
    {/* Bottom action */}
    <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
      <button className="w-full bg-(--color-primary) text-white py-4 font-bold text-lg
                         active:opacity-80">
        Lưu
      </button>
    </div>
  </div>
)}
```

> **Lưu ý z-index**: Sử dụng theo tầng: `z-10` (header), `z-80` (overlay level 1), `z-90` (overlay level 2), `z-100` (confirm dialog).

---

### Pattern 9: Empty State

```tsx
{/* Dùng khi danh sách rỗng */}
<div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
  <Utensils size={48} className="mb-2 opacity-50" />
  <p className="text-sm">Không có đơn nào</p>
</div>

{/* Với nút action */}
<div className="flex flex-col items-center justify-center h-full text-(--color-text-muted) gap-4">
  <PackageSearch size={48} className="opacity-50" />
  <p className="text-sm">Chưa có dữ liệu</p>
  <button className="text-(--color-primary) text-sm font-medium active:opacity-50">
    Thêm mới
  </button>
</div>
```

---

### Pattern 10: Confirm Dialog

Overlay toàn màn hình với dialog trắng bo tròn ở giữa.

```tsx
{confirmDialog.isOpen && (
  <div className="absolute inset-0 bg-(--color-text-main)/40 z-100 flex items-center
                  justify-center p-6 animate-in fade-in">
    <div className="bg-(--color-bg-surface) rounded-2xl w-full overflow-hidden
                    animate-in zoom-in-95">
      <div className="p-6 text-center">
        <h3 className="font-bold text-(--color-text-main) text-lg mb-2">
          {confirmDialog.title}
        </h3>
        <p className="text-(--color-text-secondary) text-sm">
          {confirmDialog.message}
        </p>
      </div>
      <div className="flex border-t border-(--color-border-main)">
        <button
          onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          className="flex-1 py-4 text-(--color-text-secondary) text-base
                     active:bg-(--color-bg-subtle) border-r border-(--color-border-main)"
        >
          Hủy
        </button>
        <button
          onClick={confirmDialog.onConfirm}
          className="flex-1 py-4 text-(--color-danger) font-bold text-base
                     active:bg-(--color-bg-subtle)"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
)}
```

---

### Pattern 11: Bottom Navigation Bar

```tsx
<nav className="bg-(--color-bg-surface)/90 backdrop-blur-md border-t border-(--color-border-main)
                flex justify-around items-center h-[60px] pb-safe shrink-0 relative z-10">
  {[
    { icon: <BarChart3 />, label: 'Tổng quan', tab: 'dashboard' },
    { icon: <Utensils />,  label: 'Đơn hàng',  tab: 'orders'    },
    { icon: <PackageSearch />, label: 'Nhập hàng', tab: 'imports' },
    { icon: <Settings />,  label: 'Quản lý',   tab: 'settings'  },
  ].map(({ icon, label, tab }) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className="flex flex-col items-center justify-center w-full h-full
                   transition-all active:scale-95 duration-200"
      >
        <div className={isActive ? 'text-(--color-primary)' : 'text-(--color-text-tertiary)'}>
          {React.cloneElement(icon, {
            size: 24,
            strokeWidth: isActive ? 2.5 : 2,
          })}
        </div>
        <span className={`text-[10px] mt-0.5 font-medium
          ${isActive ? 'text-(--color-primary)' : 'text-(--color-text-tertiary)'}`}>
          {label}
        </span>
      </button>
    );
  })}
</nav>
```

---

### Pattern 12: Card đơn hàng (Order Card)

Card có header, body items, footer với action buttons.

```tsx
<div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) flex flex-col">

  {/* Header card */}
  <div className="px-4 h-10 flex justify-between items-center
                  border-b border-(--color-border-main)">
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-(--color-text-main) font-money">
        #{formatId(order.id)}
      </span>
      <span className="text-(--color-text-muted)">•</span>
      <span className="text-sm font-semibold text-(--color-text-main)">
        {order.tableName}
      </span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs text-(--color-text-emphasis)">{order.time}</span>
      {/* Action group — cách nhau bởi border trái */}
      <div className="flex items-center gap-4 border-l border-(--color-border-subtle) pl-4">
        <button className="text-(--color-primary) active:opacity-50"><Info size={18} /></button>
        <button className="text-(--color-warning) active:opacity-50"><Edit3 size={18} /></button>
        <button className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
      </div>
    </div>
  </div>

  {/* Body — danh sách items */}
  <div className="px-4 py-2">
    {items.map((item, idx) => (
      <div
        key={idx}
        className={`flex items-center italic
          ${idx !== items.length - 1
            ? 'mb-1 pb-1 border-b border-(--color-border-main) border-dashed'
            : ''
          }`}
      >
        <span className="text-sm text-(--color-text-main) min-w-[40px]">{item.qty}x</span>
        <span className="text-sm text-(--color-text-emphasis)">{item.name}</span>
      </div>
    ))}
  </div>

  {/* Footer — tóm tắt + advance/revert buttons */}
  <div className="flex justify-between items-stretch
                  border-t border-(--color-border-main) overflow-hidden h-10">
    <div className="flex items-center text-[12px] text-(--color-text-emphasis) px-4">
      {itemCount} món • {portionCount} phần
    </div>
    <div className="flex flex-1">
      <button className="flex-1 flex items-center justify-center border-l
                         border-(--color-border-subtle) text-(--color-primary)
                         active:bg-(--color-primary-light) transition-colors">
        <ArrowLeftFromLine size={14} />
      </button>
      <button className="flex-[1.5] flex items-center justify-center border-l
                         border-(--color-border-subtle) text-(--color-primary)
                         active:bg-(--color-primary-light) transition-colors">
        <ArrowRightFromLine size={14} />
      </button>
    </div>
  </div>

</div>
```

---

### Pattern 13: Profile Card (Settings page)

```tsx
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main)
                flex items-center gap-4 px-4 py-3 mt-4">
  {/* Avatar chữ cái đầu */}
  <div className="w-12 h-12 rounded-full bg-(--color-primary) text-(--color-bg-surface)
                  flex items-center justify-center font-bold text-xl">
    {user.name.charAt(0).toUpperCase()}
  </div>
  <div className="flex-1">
    <p className="text-(--color-text-main) font-semibold">{user.name}</p>
    <p className="text-sm text-(--color-text-secondary)">{user.phone}</p>
  </div>
</div>
```

---

### Pattern 14: Settings Navigation Items với màu icon badge

Mỗi mục trong Settings dùng icon badge màu khác nhau theo ngữ cảnh.

```tsx
{/* Bảng màu icon badge cho Settings */}
// Cửa hàng  → bg-(--color-primary-light)  text-(--color-primary-dark)
// Thực đơn  → bg-(--color-warning-light)  text-(--color-warning-dark)
// Khu vực   → bg-(--color-success-light)  text-(--color-success)
// Quy trình → bg-(--color-info-light)     text-(--color-info)
// Xóa/Logout→ bg-(--color-danger-light)   text-(--color-danger)

<button className="w-full px-4 py-3 flex items-center justify-between
                   active:bg-(--color-bg-subtle) transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-(--color-warning-light) text-(--color-warning-dark)
                    flex items-center justify-center">
      <BookOpen size={18} />
    </div>
    <span className="text-sm text-(--color-text-main) font-medium">Thực đơn</span>
  </div>
  <ChevronRight size={20} className="text-(--color-text-placeholder)" />
</button>
```

---

### Pattern 15: Badge / Status Tag nhỏ

```tsx
{/* Badge "Có khách" */}
<span className="text-[10px] bg-(--color-warning) text-(--color-bg-surface)
                 px-1.5 py-0.5 rounded font-medium">
  Có khách
</span>

{/* Badge trạng thái đơn */}
<span className="text-[10px] bg-(--color-bg-subtle) text-(--color-text-tertiary)
                 px-1.5 py-0.5 rounded font-bold">
  {item.status}
</span>

{/* Badge đếm trong tab */}
<span className="px-1.5 py-0.5 rounded text-[10px]
                 bg-(--color-primary-light) text-(--color-primary-dark)">
  {count}
</span>
```

---

### Pattern 16: Auth Screen Layout

```tsx
<div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
  {/* Hero/Logo section */}
  <div className="bg-(--color-bg-surface) border-b border-(--color-border-main)
                  p-12 flex flex-col items-center justify-center shrink-0">
    <div className="w-12 h-12 bg-(--color-primary) flex items-center justify-center
                    text-(--color-bg-surface) mb-4">
      <StoreIcon size={24} />
    </div>
    <h1 className="text-2xl font-bold text-(--color-text-main) tracking-tight">
      Orderly
    </h1>
    <div className="mt-1 h-0.5 w-8 bg-(--color-primary)"></div>
  </div>

  {/* Form section */}
  <div className="flex-1 flex flex-col min-h-0">
    <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">
      Đăng nhập hệ thống
    </div>
    <form className="flex-1 flex flex-col min-h-0">
      {/* Input fields */}
      <div className="bg-(--color-bg-surface) border-y border-(--color-border-main)
                      divide-y divide-gray-100">
        <div className="px-4 py-5 flex items-center gap-4">
          <Phone className="text-(--color-text-placeholder)" size={18} />
          <input
            type="tel"
            placeholder="Số điện thoại"
            className="flex-1 bg-transparent outline-none text-sm font-medium
                       text-(--color-text-main) placeholder:text-(--color-text-placeholder)"
          />
        </div>
      </div>

      {/* Push to bottom */}
      <div className="mt-auto">
        <button type="submit"
          className="w-full py-4 bg-(--color-primary) text-(--color-bg-surface)
                     font-bold text-lg active:opacity-80 transition-opacity">
          Đăng nhập
        </button>
        {/* Toggle link */}
        <button type="button"
          className="w-full py-6 bg-(--color-bg-surface) border-t border-(--color-border-main)
                     text-sm font-medium text-(--color-primary) active:bg-(--color-bg-active)">
          Bạn chưa có tài khoản? Đăng ký ngay
        </button>
      </div>
    </form>
  </div>
</div>
```

---

### Pattern 17: Menu Item Row (Quick Order)

Row chọn món ăn với stepper tăng/giảm số lượng.

```tsx
{/* Món chưa trong giỏ — chỉ hiện nút + */}
<div className="px-4 py-3 flex items-center justify-between">
  <div className="flex-1">
    <p className="text-base text-(--color-text-main)">{item.name}</p>
    <p className="text-sm text-(--color-text-secondary) mt-0.5 font-money">
      {formatMoney(item.price)}
    </p>
  </div>
  <button
    onClick={() => addItem(item)}
    className="w-8 h-8 rounded-full bg-(--color-bg-subtle) flex items-center justify-center
               text-(--color-primary) active:bg-(--color-border-main) transition-colors"
  >
    <Plus size={18} />
  </button>
</div>

{/* Món đã trong giỏ — hiện stepper */}
<div className="px-4 py-3 flex items-center justify-between">
  <div className="flex-1">
    <p className="text-base text-(--color-text-main)">{item.name}</p>
    <p className="text-sm text-(--color-text-secondary) mt-0.5 font-money">
      {formatMoney(item.price)}
    </p>
  </div>
  <div className="flex items-center gap-4">
    <button
      onClick={() => changeQty(item, -1)}
      className="w-8 h-8 rounded-full bg-(--color-bg-subtle) flex items-center justify-center
                 text-(--color-primary) active:bg-(--color-border-main) transition-colors"
    >
      <Minus size={18} />
    </button>
    <span className="font-semibold text-lg w-4 text-center">{qty}</span>
    <button
      onClick={() => changeQty(item, 1)}
      className="w-8 h-8 rounded-full bg-(--color-primary) text-(--color-bg-surface)
                 flex items-center justify-center active:opacity-80 transition-colors"
    >
      <Plus size={18} />
    </button>
  </div>
</div>
```

---

### Pattern 18: Xếp hạng Top Items (Dashboard)

```tsx
{topItems.map((item, idx) => (
  <div key={idx} className="p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Số thứ tự có màu khác nhau */}
      <div className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold
        ${idx === 0 ? 'bg-(--color-warning-light) text-(--color-warning-dark)' :
          idx === 1 ? 'bg-(--color-bg-subtle) text-(--color-text-emphasis)' :
                      'bg-(--color-bg-subtle) text-(--color-text-secondary)'}`}>
        {idx + 1}
      </div>
      <span className="text-sm text-(--color-text-main) font-semibold">{item.name}</span>
    </div>
    <span className="text-sm font-semibold text-(--color-text-main) font-money">
      {item.qty}
    </span>
  </div>
))}
```

---

### Pattern 19: Logout / Danger Action Row

```tsx
<div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
  <button
    onClick={handleLogout}
    className="w-full px-4 py-3 flex items-center justify-start gap-3
               text-(--color-danger) active:bg-(--color-bg-subtle) transition-colors"
  >
    <div className="w-8 h-8 rounded-lg bg-(--color-danger-light) flex items-center justify-center">
      <LogOut size={18} />
    </div>
    <span className="text-sm font-semibold">Đăng xuất</span>
  </button>
</div>
```

---

### Pattern 20: Swipe gesture (Touch handlers)

Dùng để chuyển tab bằng vuốt ngang.

```tsx
const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  const t = e.touches[0];
  setTouchStart({ x: t.clientX, y: t.clientY });
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!touchStart) return;
  const t    = e.changedTouches[0];
  const dx   = t.clientX - touchStart.x;
  const dy   = t.clientY - touchStart.y;
  // Chỉ xử lý swipe ngang (dx > 2*dy và dx > 50px)
  if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 50) {
    if (dx < 0) goToNextTab();
    else        goToPrevTab();
  }
  setTouchStart(null);
};

// Gắn vào container cần swipe
<div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
  {/* content */}
</div>
```

---

### Sơ đồ nhanh: Chọn pattern nào?

```
Cần tạo trang mới?
├── Bắt đầu với Pattern 1 (Khung trang chuẩn)
├── Thêm Pattern 2 (ScreenHeader)
├── Có danh sách? → Pattern 3 + 4
├── Có tab? → Pattern 5
├── Có form? → Pattern 6 + 7
├── Có nút xóa? → Pattern 10 (Confirm Dialog)
├── Trang rỗng? → Pattern 9 (Empty State)
└── Overlay/modal? → Pattern 8
```

---

*Tài liệu này được cập nhật lần cuối cho phiên bản: React 19 · Vite 8 (Rolldown) · TypeScript 6 · TanStack Query v5 · Zustand v5 · Node 24*