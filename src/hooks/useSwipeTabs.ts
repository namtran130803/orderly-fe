import { useCallback, useRef } from "react";

interface UseSwipeTabsOptions<T extends number | string> {
  items: { id: T }[];
  currentId: T | null;
  setCurrentId: (id: T) => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeTabs<T extends number | string>({
  items,
  currentId,
  setCurrentId,
  threshold = 50,
  enabled = true,
}: UseSwipeTabsOptions<T>) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;
      startX.current = clientX;
      startY.current = clientY;
      isDragging.current = true;
    },
    [enabled],
  );

  const handleEnd = useCallback(
    (clientX: number) => {
      if (!isDragging.current || !enabled) return;
      isDragging.current = false;

      const deltaX = clientX - startX.current;
      if (Math.abs(deltaX) < threshold) return;

      const currentIdx = items.findIndex((item) => item.id === currentId);
      if (currentIdx === -1) return;

      if (deltaX > 0 && currentIdx > 0) {
        setCurrentId(items[currentIdx - 1].id);
      } else if (deltaX < 0 && currentIdx < items.length - 1) {
        setCurrentId(items[currentIdx + 1].id);
      }
    },
    [enabled, items, currentId, setCurrentId, threshold],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    [handleStart],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      handleEnd(e.changedTouches[0].clientX);
    },
    [handleEnd],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    },
    [handleStart],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      handleEnd(e.clientX);
    },
    [handleEnd],
  );

  return {
    onTouchStart: enabled ? onTouchStart : undefined,
    onTouchEnd: enabled ? onTouchEnd : undefined,
    onMouseDown: enabled ? onMouseDown : undefined,
    onMouseUp: enabled ? onMouseUp : undefined,
  };
}
