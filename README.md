# Orderly POS — Frontend

Mobile-first POS web app for coffee shop chains. React 19, TypeScript 6, Vite 8, Tailwind CSS v4.

## Yêu cầu

- **Docker** (không cần Node.js trên máy)
- Backend API (`orderly-be`) đang chạy

## Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up
# Mở http://localhost:5173 — sửa code tự reload
```

Sửa `VITE_API_URL` trong `docker-compose.dev.yml` cho đúng địa chỉ backend:

- `host.docker.internal:3000` — nếu backend chạy ngoài Docker (Windows/Mac)
- `backend:3000` — nếu backend là container cùng compose

## Production

```bash
# Build + serve luôn
docker compose up -d
# Mở http://localhost

# Hoặc build image riêng để deploy
docker build -t orderly-fe .
docker run -d -p 80:80 orderly-fe
```

## Cấu hình

| Biến           | Mặc định | Mô tả                                 |
| -------------- | -------- | ------------------------------------- |
| `VITE_API_URL` | `/api`   | API base path                         |
| `PORT`         | `80`     | Cổng host khi chạy compose production |

Nginx proxy sẵn `/api` → `http://backend:3000` (sửa `nginx.conf` nếu backend ở chỗ khác).
