---
name: add-service
description: Use when creating or editing API service modules under src/services/. Services follow a consistent CRUD pattern with Axios and are scoped to a storeId.
---

# Service Module Pattern

Location: `src/services/<name>.service.ts`

Every service:
- Imports `api` from `@/lib/api`
- Exports response types (e.g., `Expense`, `Employee`)
- Exports a plain `const` object with method names
- First argument is always `storeId: number`
- API paths follow: `/stores/${storeId}/<resource>` or `/stores/${storeId}/<resource>/<id>`
- Response type is always `{ success: true; data: T; message: string }`

## CRUD pattern

```typescript
import { api } from '@/lib/api';

export const xService = {
  list: (storeId: number, params?: { cursor?: number; limit?: number }) =>
    api.get<{ success: true; data: { items: X[]; nextCursor: number | null }; message: string }>(
      `/stores/${storeId}/xs`, { params }
    ),

  create: (storeId: number, data: CreateXDto) =>
    api.post<{ success: true; data: X; message: string }>(`/stores/${storeId}/xs`, data),

  update: (storeId: number, id: number, data: Partial<CreateXDto>) =>
    api.put<{ success: true; data: X; message: string }>(`/stores/${storeId}/xs/${id}`, data),

  remove: (storeId: number, id: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/xs/${id}`),
};
```

For non-CRUD endpoints, use custom method names like `getAll`, `assignRoles`, `updateSalary`.

## Auth service (no storeId)

```typescript
export const authService = {
  login: (data: LoginDto) =>
    api.post<{ success: boolean; data: { token: string; user: User }; message: string }>('/auth/login', data),
  // ...
};
```
