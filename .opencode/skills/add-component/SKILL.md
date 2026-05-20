---
name: add-component
description: Use when creating or editing shared UI components in src/components/. Components are reusable, presentational, use named exports, and follow the project's flat design + Tailwind CSS v4 styling.
---

# Shared Component Pattern

Location: `src/components/<Name>.tsx`

## Rules
- Named export (no `export default`)
- Use `React.FC<Props>` type
- Import types from `react` when needed
- Use Lucide React icons from `lucide-react`
- Use CSS variable colors with arbitrary value syntax

## Existing components reference

### Header
```typescript
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { navigateBackOrTo } from '@/lib/browser-history';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  Icon?: React.ElementType;
  children?: React.ReactNode;
  backUrl?: string;
}
```
Usage: `<Header Icon={HandCoins} title="Chi tiêu" backUrl={paths.expenses.index}> <Link>...</Link> </Header>`

### ConfirmDialog
```typescript
type ConfirmDialogVariant = 'danger' | 'warning' | 'success';
type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
};
```

### LoadingOverlay
```typescript
// Shows a centered spinner overlay
<div className="absolute inset-0 z-50 flex items-center justify-center bg-(--color-bg-surface)/80">
  <div className="size-10 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
</div>
```

## New component template

```typescript
import React from 'react';

type Props = {
  // define props
};

export const MyComponent: React.FC<Props> = ({ /* props */ }) => {
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```
