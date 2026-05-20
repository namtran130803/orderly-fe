---
name: react-query
description: Use when working with TanStack React Query v5 patterns in this project. Covers useQuery, useInfiniteQuery (cursor-based), useMutation, and query invalidation.
---

# React Query Patterns

Query client is configured in `src/lib/queryClient.ts` with `staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: false`.

## Standard query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource', storeId, ...params],
  queryFn: async () => {
    const res = await service.list(storeId!);
    return res.data.data;
  },
  enabled: !!storeId,
});
```

## Infinite query (cursor-based pagination)

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
  useInfiniteQuery({
    queryKey: ['resource', storeId, ...params],
    queryFn: async ({ pageParam }) => {
      const res = await service.list(storeId!, { limit: 20, cursor: pageParam });
      return res.data.data; // { items: T[]; nextCursor: number | null }
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!storeId,
  });

const items = data?.pages.flatMap((page) => page.items) || [];
```

Trigger load more with `useInView` from `react-intersection-observer`:

```typescript
const { ref: sentinelRef } = useInView({
  onChange: (inView) => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  },
});
```

## Mutation

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (data: CreateDto) => service.create(storeId!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource', storeId] });
    // optional: navigate or toast
  },
});
```

## Query invalidation

```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['resource', storeId] });
```

## Query key naming convention

- `[resource, storeId]` — list queries
- `[resource, storeId, id]` — detail queries  
- Always include `storeId` in the key (when applicable) so switching stores auto-refetches
