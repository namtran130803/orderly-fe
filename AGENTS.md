# Orderly POS Frontend — Project Rules

## Project Identity

- **Orderly POS** — mobile-first POS web app for coffee shop chains
- React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4
- Vietnamese UI (all labels, messages, toasts in Vietnamese)

## UI/UX Principles (CRITICAL)

### Mobile-Only Design
- App is designed **exclusively for phone screens** (max-width 390px, centered via `AppShell`)
- **Never write desktop-responsive code** — no `lg:`, `md:`, `xl:` breakpoints
- All interactive elements sized for finger taps (min 44px touch targets)

### Flat, Full-Bleed Style
- **No rounded corners** (except `ConfirmDialog` modal, avatar circles)
- **No shadows/box-shadows**
- Full-width borders using `border-y border-(--color-border-main)`
- Dividers between items: `divide-y divide-(--color-border-main)`
- Color variables from `index.css` (`--color-primary`, `--color-bg-surface`, etc.) must be used with arbitrary value syntax: `bg-(--color-bg-surface)`, `text-(--color-primary)`, `border-(--color-border-main)`

### One Page, One Function
- **Each page = one form = one function.** Never cram multiple forms/actions onto one screen
- **Do NOT use dialogs/modals for data entry (create/edit/delete forms).** Always navigate to a dedicated page
- `ConfirmDialog` is the ONLY dialog allowed — used exclusively for delete confirmations
- For multi-step flows: finish step 1 → auto-redirect to step 2's page → continue
- List pages show data. Tapping edit/delete icons navigates to the form page or opens ConfirmDialog

### Page Layout Structure
```
flex-1 flex flex-col relative          ← page wrapper
  <LoadingOverlay />                   ← shown during any pending state
  <Header Icon={..} title="..">        ← top bar with back button
    <Link/CirclePlus>                  ← right action (usually create)
  </Header>
  flex-1 relative                      ← scrollable content area
    absolute inset-0 flex
      flex-1 overflow-auto pb-4
        bg-(--color-bg-surface) border-y border-(--color-border-main)
          divide-y divide-(--color-border-main)  ← item list
```

### Empty State
When no data exists, show centered muted message with icon:
```
flex flex-col items-center justify-center h-full text-(--color-text-muted)
  <Icon size={48} className="mb-2 opacity-50" />
  <p>Không có dữ liệu</p>
```

## Code Conventions

### File Naming
| Type | Convention | Example |
|---|---|---|
| Pages | PascalCase + `Page` suffix | `ExpensesPage.tsx`, `StoresFormPage.tsx` |
| Services | camelCase + `.service.ts` | `expense.service.ts` |
| Schemas | camelCase + `.schema.ts` | `expense.schema.ts` |
| Stores | camelCase + `.store.ts` | `auth.store.ts` |
| Components | PascalCase | `Header.tsx`, `ConfirmDialog.tsx` |
| Utils/Hooks | camelCase | `formatMoney.ts`, `useSwipeTabs.ts` |
| Config | lower case | `paths.ts` |

### Always Use Named Exports
- Never use `export default` in components/pages/services/stores/schemas
- Exception: `App.tsx` and `main.tsx` use `export default`

### Imports
- Use `@/` alias mapping to `./src/`
- Order: React → libraries → components → services → schemas → stores → utils → config

### Types
- Export response types from service files or schema files
- Use `z.infer<typeof schema>` for DTO types from Zod schemas
- Use plain `interface` for response/entity types

### Styling — Tailwind CSS v4 with CSS Variables
```css
/* Use arbitrary value syntax — never use arbitrary colors */
text-(--color-primary)
bg-(--color-bg-surface)
border-(--color-border-main)
text-(--color-text-secondary)
text-(--color-danger)    /* delete, errors */
text-(--color-warning)   /* edit */
```

## Architecture — Vertical Slicing

Each feature follows this layer pattern:

```
Route (App.tsx) → Layout → Page → Service → API (Axios)
                                    → Schema (Zod + React Hook Form)
                                    → Store (Zustand)
```

### Service Layer `src/services/<name>.service.ts`
- Plain object with CRUD methods: `list`, `create`, `update`, `remove`
- First param is always `storeId: number` (resources are store-scoped)
- API paths: `/stores/{storeId}/{resource}`
- Response type: `{ success: true; data: T; message: string }`

### Schema Layer `src/schemas/<name>.schema.ts`
- Zod schema → `zodResolver` → typed DTO (`z.infer`)
- Resolver name: `create<Name>Resolver`
- DTO name: `Create<Name>Dto`

### Store Layer `src/stores/<name>.store.ts`
- Zustand, use `persist` middleware only for auth/store selection
- Order/cart store is NOT persisted (session-only)
- Always prefix hook: `use<Name>Store`

### Page Layer — List Pages
- Uses `useInfiniteQuery` for cursor-based pagination
- Uses `useMutation` for delete
- `ConfirmDialog` for delete confirmation (never inline delete)
- Loading: `<LoadingOverlay />` during any pending state

### Page Layer — Form Pages
- `Props = { type: 'create' | 'edit' }` prop
- React Hook Form + Zod resolver
- Edit mode receives existing data via `location.state`
- Uses `navigateBackOrTo(navigate, paths.xxx.index)` after successful save
- Form errors shown via `toast.error(firstErrorMessage)`
- Submit button in Header (right action), form id linked via `form` attribute

### Routing `src/App.tsx`
- All authenticated pages nested under `MainLayout` (which shows bottom Navbar)
- Pages without Navbar (e.g., kiosk) are siblings of `MainLayout`
- Pages without store guard (e.g., store selection) are siblings of `StoreGuardLayout`
- Paths defined in `src/config/paths.ts`

## Data Fetching

### Standard Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource', storeId],
  queryFn: async () => { const res = await service.list(storeId!); return res.data.data; },
  enabled: !!storeId,
});
```

### Infinite Query (cursor-based pagination)
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['resource', storeId],
  queryFn: async ({ pageParam }) => { ... return res.data.data; },
  initialPageParam: undefined as number | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  enabled: !!storeId,
});
const items = data?.pages.flatMap((page) => page.items) || [];
```

Trigger load-more with `useInView` from `react-intersection-observer`.

### Mutation
```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (data) => service.create(storeId!, data),
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['resource', storeId] }); },
});
```

## Error Handling
- API errors: Axios interceptor shows toast + clears all stores on 401
- Form validation: `onError` callback shows first field error via toast
- Network errors: Vietnamese message "Không kết nối được máy chủ"

## What NOT To Do
- DO NOT add desktop/tablet responsive styles
- DO NOT use dialogs for create/edit forms — always navigate to a dedicated page
- DO NOT cram multiple forms on one page
- DO NOT use `useState` for server state — always use React Query
- DO NOT use Redux — only Zustand for client state
- DO NOT use CSS modules/styled-components — only Tailwind with CSS variable syntax
- DO NOT use default exports (except App.tsx, main.tsx)
- DO NOT add comments unless the code is unusually complex
