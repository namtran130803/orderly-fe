---
name: add-route
description: Use when adding, modifying, or understanding routes in src/App.tsx and src/config/paths.ts. Routes use React Router DOM v7 with createBrowserRouter and nested layouts.
---

# Routing Patterns

## Route structure

```
AppShell (max-w-[390px] frame + Toaster)
  └─ SplashLayout (auth guard — checks token, fetches /auth/me)
       ├─ AuthLayout (brand header)
       │    ├─ /auth/login → LoginPage
       │    └─ /auth/register → RegisterPage
       ├─ StoreGuardLayout (redirects to store selection if no store active)
       │    ├─ MainLayout (content + bottom Navbar)
       │    │    ├─ /overview → OverviewPage
       │    │    ├─ /expenses → ExpensesPage
       │    │    ├─ /expenses/create → ExpensesFormPage (type="create")
       │    │    ├─ /expenses/:id/edit → ExpensesFormPage (type="edit")
       │    │    └─ ... (all authenticated pages)
       │    └─ /attendance/kiosk → AttendanceKioskPage (no Navbar)
       ├─ /stores → StoresPage
       └─ /stores/create → StoresFormPage (type="create")
```

## Path configuration — `src/config/paths.ts`

Define paths in the `paths` object:
```typescript
export const paths = {
  myFeature: {
    index: '/my-feature',
    create: '/my-feature/create',
    edit: (id: string | number) => `/my-feature/${id}/edit`,
  },
};
```

## Add a new route — `src/App.tsx`

Import the page, then add as a child of `MainLayout`:
```typescript
import { MyFeaturePage } from './pages/my-feature/MyFeaturePage';

// Inside MainLayout children array:
{
  path: paths.myFeature.index,
  element: <MyFeaturePage />
},
```

For routes WITHOUT a bottom navbar (e.g., kiosk), add as sibling of `MainLayout`:
```typescript
// Inside StoreGuardLayout children — same level as MainLayout
{
  path: paths.someSpecial,
  element: <SomeSpecialPage />,
},
```

For routes WITHOUT store guard (e.g., store selection, create store), add as sibling of `StoreGuardLayout`:
```typescript
// Inside SplashLayout children — same level as StoreGuardLayout
{
  path: paths.stores.index,
  element: <StoresPage />
},
```
