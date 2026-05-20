---
name: crud-operations
description: Use when implementing full CRUD (list, create, update, delete) for a resource. Covers all layers: service, schema, page (list + form), routes, and paths. Follows the consistent vertical slicing pattern.
---

# Full CRUD Pattern

When adding a new resource (e.g., "categories"), create/modify these files in order:

## 1. Service — `src/services/<name>.service.ts`
```typescript
import { api } from '@/lib/api';

export type X = { id: number; storeId: number; name: string; /* ... */ };

export const xService = {
  list: (storeId: number, params?: { cursor?: number; limit?: number }) =>
    api.get(..., `/stores/${storeId}/xs`),
  create: (storeId: number, data: CreateXDto) =>
    api.post(..., `/stores/${storeId}/xs`, data),
  update: (storeId: number, id: number, data: Partial<CreateXDto>) =>
    api.put(..., `/stores/${storeId}/xs/${id}`, data),
  remove: (storeId: number, id: number) =>
    api.delete(..., `/stores/${storeId}/xs/${id}`),
};
```

## 2. Schema — `src/schemas/<name>.schema.ts`
```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createXSchema = z.object({ name: z.string().trim().min(1) });
export const createXResolver = zodResolver(createXSchema);
export type CreateXDto = z.infer<typeof createXSchema>;
```

## 3. Paths — add to `src/config/paths.ts`
```typescript
xs: {
  index: '/xs',
  create: '/xs/create',
  edit: (id: string | number) => `/xs/${id}/edit`,
},
```

## 4. Routes — add to `src/App.tsx` under `MainLayout`
```typescript
{
  path: paths.xs.index,
  element: <XPage />
},
{
  path: paths.xs.edit(":id"),
  element: <XFormPage type="edit" />
},
{
  path: paths.xs.create,
  element: <XFormPage type="create" />
},
```

## 5. List page — `src/pages/xs/XPage.tsx`
See `add-page` skill for the full list page pattern (infinite query, delete mutation, ConfirmDialog).

## 6. Form page — `src/pages/xs/XFormPage.tsx`
See `add-page` skill for the form page pattern (React Hook Form, create/edit type prop, navigateBackOrTo).

## Import alias
All internal imports use `@/` which maps to `./src/`.
