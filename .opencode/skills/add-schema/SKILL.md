---
name: add-schema
description: Use when creating or editing Zod validation schemas under src/schemas/. Each schema defines validation rules, exports a zodResolver for React Hook Form, and exports a typed DTO.
---

# Schema Module Pattern

Location: `src/schemas/<name>.schema.ts`

Each schema file:
1. Defines a Zod schema
2. Exports a `zodResolver` for React Hook Form
3. Exports a typed DTO using `z.infer`

## Pattern

```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createXSchema = z.object({
  name: z.string().trim().min(1, 'Tên không được để trống').max(255),
  price: z.number({ message: 'Giá không hợp lệ' }).positive('Giá phải là số dương'),
  // ...
});

export const createXResolver = zodResolver(createXSchema);

export type CreateXDto = z.infer<typeof createXSchema>;
```

For response types used across the app, also export TypeScript interfaces in the same file or in the service file:

```typescript
export interface X {
  id: number;
  storeId: number;
  name: string;
  createdAt: string;
}
```

## Naming convention
- Schema variable: `create<Name>Schema` (for create), `update<Name>Schema` (for update)
- Resolver: `create<Name>Resolver`
- DTO type: `Create<Name>Dto`
